// Polyfill seguro para almacenamiento con verificación de contexto
const safeStorage = {
    get: (key) => {
        try {
            if (typeof window === 'undefined') return null;
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn("Error accediendo a localStorage:", e);
            return safeStorage.memory[key] || null;
        }
    },
    set: (key, value) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            }
        } catch (e) {
            console.warn("No se pudo usar localStorage, usando memoria:", e);
            safeStorage.memory = safeStorage.memory || {};
            safeStorage.memory[key] = value;
            return false;
        }
    },
    memory: {}
};

// Elementos UI con verificación de existencia
const UI = {
    connectWalletBtn: document.getElementById('connectWallet'),
    walletBalanceSpan: document.getElementById('walletBalance'),
    networkNameSpan: document.getElementById('networkName'),
    nftGrid: document.getElementById('nftGrid'),
    mintForm: document.getElementById('mintForm'),
    nftModal: document.getElementById('nftModal') ? new bootstrap.Modal('#nftModal') : null,
    transactionModal: document.getElementById('transactionModal') ? new bootstrap.Modal('#transactionModal') : null
};

// Variables globales
let nftContract;
let provider;
let signer;
let userAddress;

// Configuración de Sepolia mejorada
const SEPOLIA_CONFIG = {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
};

// ================== FUNCIONES MEJORADAS ================== //

async function setupNetwork() {
    if (!window.ethereum) {
        throw new Error("No se detectó un proveedor Ethereum. Instala MetaMask.");
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

        // Si ya estamos en la red correcta
        if (chainId === SEPOLIA_CONFIG.chainId) return true;

        // Intenta cambiar de red
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CONFIG.chainId }]
            });
            return true;
        } catch (switchError) {
            // Manejo específico de errores
            if (switchError.code === 4001) {
                throw new Error("Cancelaste el cambio de red");
            } else if (switchError.code === 4902) {
                // Agregar red si no existe
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [SEPOLIA_CONFIG]
                });
                return true;
            } else {
                throw new Error(`Por favor cambia manualmente a Sepolia (ID: ${SEPOLIA_CONFIG.chainId})`);
            }
        }
    } catch (error) {
        console.error("Error en setupNetwork:", error);
        throw error;
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        showError("MetaMask no detectado. Por favor instálalo.");
        return false;
    }

    try {
        // Configurar red
        try {
            await setupNetwork();
        } catch (networkError) {
            showError(networkError.message);
            return false;
        }

        // Solicitar cuentas
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        }).catch(err => {
            if (err.code === 4001) throw new Error("Cancelaste la conexión");
            throw err;
        });

        if (!accounts?.length) throw new Error("No se obtuvieron cuentas");

        // Configurar ethers.js
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = accounts[0];
        
        // Verificar configuración del contrato
        if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
            throw new Error("Configuración del contrato incompleta");
        }
        
        nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Actualizar UI
        updateWalletUI();
        await updateNetworkInfo();
        await loadNFTs();
        
        return true;
    } catch (error) {
        console.error("Error en connectWallet:", error);
        showError(error.message.includes("Cancelaste") ? error.message : 
                 "Error al conectar. Por favor inténtalo de nuevo.");
        return false;
    }
}

// ================== FUNCIONES PRINCIPALES ================== //

async function loadNFTs() {
    if (!nftContract || !UI.nftGrid) return;

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
                    image: metadata.image || 'https://via.placeholder.com/300',
                    forSale: nftDetails.forSale,
                    owner: nftDetails.owner
                });
            } catch (error) {
                console.warn(`Error cargando NFT ${i}:`, error);
            }
        }

        renderNFTs(nfts);
    } catch (error) {
        console.error("Error cargando NFTs:", error);
        showErrorState("Error al cargar NFTs");
    }
}

async function fetchNFTMetadata(uri) {
    try {
        const response = await fetch(uri);
        if (!response.ok) throw new Error("Error en la respuesta");
        return await response.json();
    } catch (error) {
        console.warn("Error cargando metadatos:", error);
        return { name: "NFT", description: "", image: "https://via.placeholder.com/300" };
    }
}

function renderNFTs(nfts) {
    if (!UI.nftGrid) return;

    UI.nftGrid.innerHTML = nfts.length ? nfts.map(nft => `
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
    `).join('') : `
        <div class="col-12 text-center py-5">
            <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
            <h4>No hay NFTs disponibles</h4>
            <p class="text-muted">Sé el primero en crear un NFT</p>
        </div>
    `;

    // Event listeners para botones de compra
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const tokenId = btn.getAttribute('data-id');
            const nft = nfts.find(n => n.id == tokenId);
            if (nft) await buyNFT(nft.id, nft.price);
        });
    });
}

// ================== FUNCIONES AUXILIARES ================== //

function updateWalletUI() {
    if (!UI.connectWalletBtn) return;

    UI.connectWalletBtn.innerHTML = userAddress ? `
        <i class="fas fa-check-circle me-2"></i>
        ${shortenAddress(userAddress)}
    ` : `
        <i class="fas fa-wallet me-2"></i>
        Conectar Wallet
    `;

    UI.connectWalletBtn.classList.toggle('connected', !!userAddress);
}

async function updateNetworkInfo() {
    if (!provider || !userAddress || !UI.walletBalanceSpan || !UI.networkNameSpan) return;
    
    try {
        const [balance, network] = await Promise.all([
            provider.getBalance(userAddress),
            provider.getNetwork()
        ]);
        
        UI.walletBalanceSpan.textContent = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
        UI.networkNameSpan.textContent = network.name === 'unknown' ? 'Sepolia' : network.name;
    } catch (error) {
        console.error("Error actualizando info de red:", error);
    }
}

// ================== MANEJO DE UI ================== //

function showLoadingState() {
    if (UI.nftGrid) {
        UI.nftGrid.innerHTML = `
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
    if (UI.nftGrid) {
        UI.nftGrid.innerHTML = `
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
    if (!UI.transactionModal) return;

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
        UI.transactionModal.show();
    }
}

function showError(message) {
    const existingAlerts = document.querySelectorAll('.global-alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = 'global-alert alert alert-danger position-fixed top-0 end-0 m-3';
    alertDiv.style.zIndex = '1100';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.classList.add('fade');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

function shortenAddress(address) {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
}

// ================== INICIALIZACIÓN ================== //

function setupEventListeners() {
    if (UI.connectWalletBtn) {
        UI.connectWalletBtn.addEventListener('click', connectWallet);
    }

    if (UI.mintForm) {
        UI.mintForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!userAddress) {
                showError("Conecta tu wallet primero");
                return;
            }

            const formData = {
                name: document.getElementById('nftName')?.value,
                description: document.getElementById('nftDescription')?.value,
                imageUrl: document.getElementById('nftImage')?.value,
                price: document.getElementById('nftPrice')?.value
            };

            if (!formData.name || !formData.price || !formData.imageUrl) {
                showError("Por favor completa todos los campos requeridos");
                return;
            }

            try {
                showTransactionModal("Creando NFT...");
                const tokenURI = JSON.stringify({
                    name: formData.name,
                    description: formData.description || "",
                    image: formData.imageUrl
                });
                
                const tx = await nftContract.mintNFT(
                    tokenURI, 
                    ethers.utils.parseEther(formData.price),
                    { value: ethers.utils.parseEther("0.001") }
                );

                await tx.wait();
                showTransactionModal("¡NFT creado exitosamente!", tx.hash);
                UI.mintForm.reset();
                
                setTimeout(() => {
                    if (UI.transactionModal) UI.transactionModal.hide();
                    loadNFTs();
                }, 2000);
            } catch (error) {
                console.error("Error creando NFT:", error);
                showError(error.reason || error.message || "Error al crear NFT");
                if (UI.transactionModal) UI.transactionModal.hide();
            }
        });
    }
}

async function initApp() {
    try {
        // Verificar dependencias
        if (typeof ethers === 'undefined') {
            throw new Error("La biblioteca ethers.js no está cargada");
        }

        if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
            throw new Error("La configuración del contrato no está completa");
        }

        // Verificar conexión existente
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                userAddress = accounts[0];
                nftContract = new ethers.Contract(contractAddress, contractABI, signer);
                updateWalletUI();
                await updateNetworkInfo();
            }
        }

        setupEventListeners();
        await loadNFTs();
    } catch (error) {
        console.error("Error inicializando la aplicación:", error);
        showError(error.message || "Error al iniciar la aplicación");
    }
}

// Inicialización segura
if (document.readyState === 'complete') {
    initApp();
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}

// Escuchadores de eventos de MetaMask
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