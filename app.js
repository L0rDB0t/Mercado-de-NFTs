// ================== CONFIGURACIÓN INICIAL ================== //

// Sistema de almacenamiento seguro para Vercel
const safeStorage = {
    get: (key) => {
        try {
            if (typeof window === 'undefined') return null;
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            if (typeof window === 'undefined') return false;
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            console.warn("Acceso a storage bloqueado, usando memoria temporal");
            this.memory = this.memory || {};
            this.memory[key] = value;
            return false;
        }
    },
    memory: {}
};

// Interceptar localStorage para capturar todos los accesos
if (typeof window !== 'undefined') {
    window._originalLocalStorage = window.localStorage;
    window.localStorage = {
        getItem: (key) => safeStorage.get(key),
        setItem: (key, value) => safeStorage.set(key, value),
        removeItem: (key) => {
            try {
                delete safeStorage.memory[key];
                window._originalLocalStorage.removeItem(key);
            } catch {}
        },
        clear: () => {
            try {
                safeStorage.memory = {};
                window._originalLocalStorage.clear();
            } catch {}
        },
        key: (index) => {
            try {
                return Object.keys(safeStorage.memory)[index] || window._originalLocalStorage.key(index);
            } catch {
                return null;
            }
        },
        length: (() => {
            try {
                return Object.keys(safeStorage.memory).length || window._originalLocalStorage.length;
            } catch {
                return 0;
            }
        })()
    };
}

// Elementos UI con verificación
const uiElements = {
    connectWalletBtn: document.getElementById('connectWallet'),
    walletBalanceSpan: document.getElementById('walletBalance'),
    networkNameSpan: document.getElementById('networkName'),
    nftGrid: document.getElementById('nftGrid'),
    mintForm: document.getElementById('mintForm'),
    contractShort: document.getElementById('contractShort'),
    nftModal: document.getElementById('nftModal') ? new bootstrap.Modal('#nftModal') : null,
    transactionModal: document.getElementById('transactionModal') ? new bootstrap.Modal('#transactionModal') : null
};

// Variables globales
let nftContract;
let provider;
let signer;
let userAddress;

// Configuración de Sepolia
const SEPOLIA_CONFIG = {
    chainId: '0xaa36a7', // 11155111 en decimal
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
};

// ================== FUNCIONES PRINCIPALES ================== //

async function setupNetwork() {
    if (!window.ethereum) {
        throw new Error("No se detectó un proveedor Ethereum (como MetaMask)");
    }

    try {
        // Método universal para obtener chainId
        let chainId;
        try {
            chainId = await window.ethereum.request({ method: 'eth_chainId' });
        } catch (e) {
            console.warn("Método eth_chainId no soportado, usando net_version");
            const netVersion = await window.ethereum.request({ method: 'net_version' });
            chainId = `0x${parseInt(netVersion).toString(16)}`;
        }

        // Si ya estamos en la red correcta, no hacer nada
        if (chainId === SEPOLIA_CONFIG.chainId) {
            return true;
        }

        // Intenta cambiar de red de forma compatible
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CONFIG.chainId }],
            });
            return true;
        } catch (switchError) {
            // Si el método no está soportado o la red no existe
            if (switchError.code === 4001 || 
                switchError.code === -32002 || 
                switchError.message.includes('not supported')) {
                
                console.warn("Método wallet_switchEthereumChain no soportado, guiando al usuario");
                throw new Error(`Por favor cambia manualmente a la red Sepolia (ChainID: ${SEPOLIA_CONFIG.chainId}) en tu wallet`);
            }
            
            // Si la red no está agregada (código 4902)
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [SEPOLIA_CONFIG],
                    });
                    return true;
                } catch (addError) {
                    console.error("Error agregando red:", addError);
                    throw new Error("No se pudo agregar la red Sepolia. Por favor agrégala manualmente");
                }
            }
            
            throw switchError;
        }
    } catch (error) {
        console.error("Error en setupNetwork:", error);
        throw error;
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        showError('Por favor instala MetaMask o habilita un proveedor Ethereum');
        return false;
    }

    try {
        // 1. Configurar la red
        try {
            await setupNetwork();
        } catch (networkError) {
            console.error("Error de red:", networkError);
            showError(networkError.message);
            return false;
        }

        // 2. Solicitar acceso a cuentas
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        }).catch(err => {
            if (err.code === 4001) {
                throw new Error("Cancelaste la conexión con la wallet");
            }
            throw err;
        });

        if (!accounts || accounts.length === 0) {
            throw new Error("No se obtuvieron cuentas");
        }

        // 3. Configurar ethers.js
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = accounts[0];
        
        // 4. Verificar configuración del contrato
        if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
            throw new Error("Configuración del contrato no está completa");
        }
        
        // 5. Crear instancia del contrato
        nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // 6. Actualizar UI
        updateWalletUI();
        await updateNetworkInfo();
        await loadNFTs();
        
        return true;
    } catch (error) {
        console.error("Error en connectWallet:", error);
        
        let errorMessage = "Error al conectar";
        if (error.code === -32002) {
            errorMessage = "Ya hay una solicitud pendiente. Por favor revisa tu wallet";
        } else if (error.message.includes("manualmente")) {
            errorMessage = error.message;
        } else if (error.message.includes("Cancelaste")) {
            errorMessage = error.message;
        }
        
        showError(errorMessage);
        return false;
    }
}

async function loadNFTs() {
    if (!nftContract || !uiElements.nftGrid) {
        console.error("Contrato no inicializado o elemento nftGrid no encontrado");
        return;
    }

    try {
        showLoadingState();
        
        // Limpiar caché de NFTs
        safeStorage.set('nfts-cache', null);

        const totalSupply = await nftContract.tokenCounter();
        console.log(`Total de NFTs: ${totalSupply}`);

        const nfts = [];
        const batchSize = 5; // Procesar en lotes pequeños
        const batches = Math.ceil(totalSupply / batchSize);

        for (let batch = 0; batch < batches; batch++) {
            const start = batch * batchSize + 1;
            const end = Math.min((batch + 1) * batchSize, totalSupply);
            
            const batchPromises = [];
            for (let i = start; i <= end; i++) {
                batchPromises.push(
                    nftContract.getNFTDetails(i)
                        .then(async details => {
                            try {
                                const metadata = await fetchNFTMetadata(details.metadataURI);
                                return {
                                    id: i,
                                    name: metadata.name || `NFT #${i}`,
                                    description: metadata.description || "Sin descripción",
                                    price: ethers.utils.formatEther(details.price),
                                    image: resolveImageUrl(metadata.image),
                                    forSale: details.forSale,
                                    owner: details.owner
                                };
                            } catch (error) {
                                console.warn(`Error procesando NFT ${i}:`, error);
                                return null;
                            }
                        })
                        .catch(error => {
                            console.warn(`Error obteniendo NFT ${i}:`, error);
                            return null;
                        })
                );
            }

            const batchResults = await Promise.all(batchPromises);
            nfts.push(...batchResults.filter(nft => nft !== null));
        }

        if (nfts.length > 0) {
            safeStorage.set('nfts-cache', nfts); // Cachear resultados
            renderNFTs(nfts);
        } else {
            showErrorState("No se encontraron NFTs");
        }
    } catch (error) {
        console.error("Error cargando NFTs:", error);
        showErrorState("Error al cargar NFTs");
        
        // Intentar mostrar caché si hay error
        const cachedNFTs = safeStorage.get('nfts-cache');
        if (cachedNFTs && cachedNFTs.length > 0) {
            renderNFTs(cachedNFTs);
        }
    }
}

function resolveImageUrl(url) {
    if (!url) return 'https://via.placeholder.com/300';
    if (url.startsWith('ipfs://')) {
        return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
    }
    return url;
}

async function fetchNFTMetadata(uri) {
    try {
        const response = await fetch(uri);
        if (!response.ok) throw new Error("Error en la respuesta");
        return await response.json();
    } catch (error) {
        console.warn("Error cargando metadatos:", error);
        return {};
    }
}

function renderNFTs(nfts) {
    if (!uiElements.nftGrid) return;

    if (!nfts || nfts.length === 0) {
        uiElements.nftGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                <h4>No hay NFTs disponibles</h4>
                <p class="text-muted">Sé el primero en crear un NFT</p>
            </div>
        `;
        return;
    }

    uiElements.nftGrid.innerHTML = nfts.map(nft => `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="nft-card h-100">
                <img src="${nft.image}" alt="${nft.name}" class="nft-img" 
                     onerror="this.src='https://via.placeholder.com/300'">
                <div class="p-3 d-flex flex-column h-100">
                    <h5 class="mb-2">${nft.name}</h5>
                    <p class="text-muted flex-grow-1">${nft.description.substring(0, 100)}${nft.description.length > 100 ? '...' : ''}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="price-tag">${parseFloat(nft.price).toFixed(3)} ETH</span>
                            ${nft.forSale ? 
                                `<button class="btn btn-sm btn-primary buy-btn" data-id="${nft.id}">
                                    <i class="fas fa-shopping-cart me-1"></i> Comprar
                                </button>` : 
                                `<span class="badge bg-secondary">Vendido</span>`
                            }
                        </div>
                        <small class="text-muted d-block">
                            <i class="fas fa-user me-1"></i>${shortenAddress(nft.owner)}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Agregar event listeners a los botones de compra
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const tokenId = btn.getAttribute('data-id');
            const nft = nfts.find(n => n.id == tokenId);
            if (nft) {
                await buyNFT(nft.id, nft.price);
            }
        });
    });
}

async function buyNFT(tokenId, price) {
    if (!userAddress) {
        showError("Conecta tu wallet primero");
        return;
    }

    try {
        showTransactionModal("Procesando compra...");
        const tx = await nftContract.buyNFT(tokenId, {
            value: ethers.utils.parseEther(price)
        });
        
        await tx.wait();
        showTransactionModal("¡Compra exitosa!", tx.hash);
        setTimeout(async () => {
            if (uiElements.transactionModal) {
                uiElements.transactionModal.hide();
            }
            await loadNFTs(); // Actualizar lista después de comprar
        }, 2000);
    } catch (error) {
        console.error("Error comprando NFT:", error);
        showError(`Error al comprar: ${error.reason || error.message}`);
        if (uiElements.transactionModal) {
            uiElements.transactionModal.hide();
        }
    }
}

// ================== FUNCIONES AUXILIARES ================== //

function showLoadingState() {
    if (uiElements.nftGrid) {
        uiElements.nftGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando NFTs...</p>
            </div>
        `;
    }
}

function showErrorState(message) {
    if (uiElements.nftGrid) {
        uiElements.nftGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>${message}</h4>
                <button class="btn btn-primary mt-3" onclick="location.reload()">
                    <i class="fas fa-sync-alt me-2"></i> Reintentar
                </button>
            </div>
        `;
    }
}

function showTransactionModal(message, txHash = null) {
    const modalBody = document.querySelector('#transactionModal .modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <h5>${message}</h5>
                ${txHash ? `
                    <a href="https://sepolia.etherscan.io/tx/${txHash}" 
                       target="_blank" class="text-decoration-none">
                        Ver transacción
                    </a>
                ` : ''}
            </div>
        `;
        if (uiElements.transactionModal) {
            uiElements.transactionModal.show();
        }
    }
}

function showError(message) {
    try {
        const existingAlerts = document.querySelectorAll('.alert-dismissible');
        existingAlerts.forEach(alert => alert.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible position-fixed top-0 end-0 m-3';
        alertDiv.style.zIndex = '1100';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.add('fade');
            setTimeout(() => alertDiv.remove(), 500);
        }, 5000);
    } catch (e) {
        console.error("Error mostrando mensaje de error:", e);
    }
}

function shortenAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

async function updateNetworkInfo() {
    if (!provider || !userAddress || !uiElements.walletBalanceSpan || !uiElements.networkNameSpan) return;
    
    try {
        const [balance, network] = await Promise.all([
            provider.getBalance(userAddress),
            provider.getNetwork()
        ]);
        
        uiElements.walletBalanceSpan.textContent = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
        uiElements.networkNameSpan.textContent = network.name === 'unknown' ? 'Sepolia' : network.name;
    } catch (error) {
        console.error("Error actualizando info de red:", error);
    }
}

function updateWalletUI() {
    if (!uiElements.connectWalletBtn) return;

    if (userAddress) {
        uiElements.connectWalletBtn.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${shortenAddress(userAddress)}
        `;
        uiElements.connectWalletBtn.classList.add('connected');
    } else {
        uiElements.connectWalletBtn.innerHTML = `
            <i class="fas fa-wallet me-2"></i>
            Conectar Wallet
        `;
        uiElements.connectWalletBtn.classList.remove('connected');
    }
}

// ================== MANEJO DE FORMULARIO ================== //

function setupEventListeners() {
    if (uiElements.connectWalletBtn) {
        uiElements.connectWalletBtn.addEventListener('click', connectWallet);
    }

    if (uiElements.mintForm) {
        uiElements.mintForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!userAddress) {
                showError("Conecta tu wallet primero");
                return;
            }

            const name = document.getElementById('nftName').value;
            const description = document.getElementById('nftDescription').value;
            const imageUrl = document.getElementById('nftImage').value;
            const price = document.getElementById('nftPrice').value;

            try {
                showTransactionModal("Creando NFT...");
                const tokenURI = JSON.stringify({ 
                    name, 
                    description, 
                    image: imageUrl 
                });
                
                const tx = await nftContract.mintNFT(
                    tokenURI, 
                    ethers.utils.parseEther(price),
                    { value: ethers.utils.parseEther("0.001") }
                );

                const receipt = await tx.wait();
                showTransactionModal("¡NFT creado exitosamente!", tx.hash);
                uiElements.mintForm.reset();
                
                setTimeout(async () => {
                    if (uiElements.transactionModal) {
                        uiElements.transactionModal.hide();
                    }
                    await loadNFTs(); // Actualizar lista después de crear
                }, 2000);
            } catch (error) {
                console.error("Error creando NFT:", error);
                showError(`Error al crear NFT: ${error.reason || error.message}`);
                if (uiElements.transactionModal) {
                    uiElements.transactionModal.hide();
                }
            }
        });
    }
}

// ================== INICIALIZACIÓN ================== //

async function init() {
    try {
        // Verificar dependencias
        if (typeof ethers === 'undefined') {
            throw new Error("ethers.js no está cargado");
        }

        // Verificar configuración del contrato
        if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
            throw new Error("Configuración del contrato no encontrada");
        }

        // Mostrar dirección abreviada del contrato
        if (contractAddress && contractAddress.length > 10 && uiElements.contractShort) {
            uiElements.contractShort.textContent = 
                `${contractAddress.substring(0, 6)}...${contractAddress.substring(contractAddress.length - 4)}`;
        }

        // Inicializar con conexión existente si hay
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                userAddress = accounts[0];
                nftContract = new ethers.Contract(contractAddress, contractABI, signer);
                
                updateWalletUI();
                await updateNetworkInfo();
                await loadNFTs(); // Cargar NFTs al iniciar
            }
        }

        setupEventListeners();
    } catch (error) {
        console.error("Error inicializando:", error);
        showError("Error al iniciar la aplicación: " + (error.message || error));
    }
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'complete') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}

// Escuchadores de eventos de MetaMask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        userAddress = accounts[0] || null;
        updateWalletUI();
        if (!accounts.length) {
            showErrorState("Wallet desconectada");
        } else {
            loadNFTs().catch(e => console.error("Error cargando NFTs:", e));
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}