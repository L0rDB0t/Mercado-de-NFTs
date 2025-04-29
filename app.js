// 1. Configuración inicial segura
const isVercel = window.location.hostname.includes('vercel.app');

// 2. Funciones utilitarias básicas
function shortenAddress(address) {
    if (!address || address.length < 10) return address || '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function showError(message) {
    try {
        // Eliminar errores previos
        const existingAlerts = document.querySelectorAll('.custom-error-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Crear nuevo mensaje de error
        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-error-alert alert alert-danger position-fixed top-0 end-0 m-3';
        alertDiv.style.zIndex = '1100';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        document.body.appendChild(alertDiv);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    } catch (e) {
        console.error("Error mostrando mensaje de error:", e);
    }
}

// 3. Sistema de almacenamiento seguro
const memoryStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

// 4. Elementos UI con verificación segura
function getSafeElement(id) {
    const el = document.getElementById(id);
    if (!el) console.error(`Elemento no encontrado: ${id}`);
    return el;
}

const ui = {
    connectWalletBtn: getSafeElement('connectWallet'),
    walletBalanceSpan: getSafeElement('walletBalance'),
    networkNameSpan: getSafeElement('networkName'),
    nftGrid: getSafeElement('nftGrid'),
    mintForm: getSafeElement('mintForm'),
    contractShort: getSafeElement('contractShort'),
    nftModal: getSafeElement('nftModal') ? new bootstrap.Modal('#nftModal') : null,
    transactionModal: getSafeElement('transactionModal') ? new bootstrap.Modal('#transactionModal') : null
};

// 5. Variables de estado
let nftContract, provider, signer, userAddress;

// 6. Configuración de red
const SEPOLIA_CONFIG = {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
};

// 7. Función para actualizar la UI de la wallet
function updateWalletUI() {
    if (!ui.connectWalletBtn) return;

    if (userAddress) {
        ui.connectWalletBtn.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${shortenAddress(userAddress)}
        `;
        ui.connectWalletBtn.classList.add('connected');
    } else {
        ui.connectWalletBtn.innerHTML = `
            <i class="fas fa-wallet me-2"></i>
            Conectar Wallet
        `;
        ui.connectWalletBtn.classList.remove('connected');
    }
}

// 8. Función para conectar wallet
async function connectWallet() {
    if (!window.ethereum) {
        showError('Por favor instala MetaMask');
        return false;
    }

    try {
        // Solicitar cuentas
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        }).catch(err => {
            if (err.code === 4001) {
                throw new Error("Cancelaste la conexión con MetaMask");
            }
            throw err;
        });

        if (!accounts || accounts.length === 0) {
            throw new Error("No se obtuvieron cuentas");
        }

        // Configurar provider y contrato
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = accounts[0];
        nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Actualizar UI
        updateWalletUI();
        await updateNetworkInfo();
        await loadNFTs();
        
        return true;
    } catch (error) {
        console.error("Error conectando wallet:", error);
        showError(error.message || "Error al conectar la wallet");
        return false;
    }
}

// 9. Función para cargar NFTs
async function loadNFTs() {
    if (!nftContract || !ui.nftGrid) return;

    try {
        showLoadingState();
        
        const totalSupply = await nftContract.tokenCounter();
        const nfts = [];

        for (let i = 1; i <= totalSupply; i++) {
            try {
                const nftDetails = await nftContract.getNFTDetails(i);
                const metadata = await fetchNFTMetadata(nftDetails.metadataURI);
                
                nfts.push({
                    id: i,
                    name: metadata.name || `NFT #${i}`,
                    description: metadata.description || "Sin descripción",
                    price: ethers.utils.formatEther(nftDetails.price),
                    image: resolveImageUrl(metadata.image),
                    forSale: nftDetails.forSale,
                    owner: nftDetails.owner
                });
            } catch (error) {
                console.warn(`Error cargando NFT ${i}:`, error);
            }
        }

        renderNFTs(nfts);
        memoryStorage.setItem('nfts-cache', nfts);
    } catch (error) {
        console.error("Error cargando NFTs:", error);
        showErrorState("Error al cargar NFTs");
        
        // Intentar mostrar caché
        const cachedNFTs = memoryStorage.getItem('nfts-cache') || [];
        if (cachedNFTs.length > 0) {
            renderNFTs(cachedNFTs);
        }
    }
}

// 10. Función para mostrar estado de carga
function showLoadingState() {
    if (ui.nftGrid) {
        ui.nftGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando NFTs...</p>
            </div>
        `;
    }
}

// 11. Función para mostrar estado de error
function showErrorState(message) {
    if (ui.nftGrid) {
        ui.nftGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>${message}</h4>
                <button class="btn btn-primary mt-3" onclick="window.location.reload()">
                    <i class="fas fa-sync-alt me-2"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// 12. Función para renderizar NFTs
function renderNFTs(nfts) {
    if (!ui.nftGrid) return;

    if (!nfts || nfts.length === 0) {
        ui.nftGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                <h4>No hay NFTs disponibles</h4>
                <p class="text-muted">Sé el primero en crear un NFT</p>
            </div>
        `;
        return;
    }

    ui.nftGrid.innerHTML = nfts.map(nft => `
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

    // Agregar event listeners
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const tokenId = btn.getAttribute('data-id');
            const nft = nfts.find(n => n.id == tokenId);
            if (nft) await buyNFT(nft.id, nft.price);
        });
    });
}

// 13. Función para actualizar información de red
async function updateNetworkInfo() {
    if (!provider || !userAddress || !ui.walletBalanceSpan || !ui.networkNameSpan) return;
    
    try {
        const [balance, network] = await Promise.all([
            provider.getBalance(userAddress),
            provider.getNetwork()
        ]);
        
        ui.walletBalanceSpan.textContent = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
        ui.networkNameSpan.textContent = network.name === 'unknown' ? 'Sepolia' : network.name;
    } catch (error) {
        console.error("Error actualizando info de red:", error);
    }
}

// 14. Función para inicializar event listeners
function setupEventListeners() {
    if (ui.connectWalletBtn) {
        ui.connectWalletBtn.addEventListener('click', connectWallet);
    }

    if (ui.mintForm) {
        ui.mintForm.addEventListener('submit', async (e) => {
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
                const tokenURI = JSON.stringify({ name, description, image: imageUrl });
                const tx = await nftContract.mintNFT(
                    tokenURI, 
                    ethers.utils.parseEther(price),
                    { value: ethers.utils.parseEther("0.001") }
                );

                await tx.wait();
                showTransactionModal("¡NFT creado exitosamente!", tx.hash);
                ui.mintForm.reset();
                
                setTimeout(async () => {
                    if (ui.transactionModal) ui.transactionModal.hide();
                    await loadNFTs();
                }, 2000);
            } catch (error) {
                console.error("Error creando NFT:", error);
                showError(`Error al crear NFT: ${error.reason || error.message}`);
                if (ui.transactionModal) ui.transactionModal.hide();
            }
        });
    }
}

// 15. Función de inicialización
async function init() {
    try {
        // Verificar dependencias
        if (typeof ethers === 'undefined') {
            throw new Error("ethers.js no está cargado");
        }

        if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
            throw new Error("Configuración del contrato no encontrada");
        }

        // Mostrar dirección del contrato
        if (ui.contractShort && contractAddress) {
            ui.contractShort.textContent = shortenAddress(contractAddress);
        }

        // Conexión automática si hay wallet conectada
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                userAddress = accounts[0];
                nftContract = new ethers.Contract(contractAddress, contractABI, signer);
                
                updateWalletUI();
                await updateNetworkInfo();
                await loadNFTs();
            }
        }

        setupEventListeners();
    } catch (error) {
        console.error("Error inicializando:", error);
        showError("Error al iniciar la aplicación: " + error.message);
    }
}

// 16. Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'complete') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}

// 17. Escuchadores de eventos de MetaMask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        userAddress = accounts[0] || null;
        updateWalletUI();
        if (!accounts.length) {
            showErrorState("Wallet desconectada");
        } else {
            loadNFTs().catch(e => console.error("Error recargando NFTs:", e));
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

// 18. Funciones auxiliares
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
        return await response.json();
    } catch (error) {
        console.warn("Error cargando metadatos:", error);
        return {};
    }
}

function showTransactionModal(message, txHash = null) {
    if (!ui.transactionModal) return;
    
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
        ui.transactionModal.show();
    }
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
            if (ui.transactionModal) ui.transactionModal.hide();
            await loadNFTs();
        }, 2000);
    } catch (error) {
        console.error("Error comprando NFT:", error);
        showError(`Error al comprar: ${error.reason || error.message}`);
        if (ui.transactionModal) ui.transactionModal.hide();
    }
}