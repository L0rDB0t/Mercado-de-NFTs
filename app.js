// Polyfill seguro para almacenamiento
const safeStorage = {
    get: (key) => {
        try {
            return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(key)) : null;
        } catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            }
        } catch {
            console.warn("Storage bloqueado, usando almacenamiento en memoria");
            safeStorage.memoryStorage = safeStorage.memoryStorage || {};
            safeStorage.memoryStorage[key] = value;
            return false;
        }
    },
    memoryStorage: {}
};

// Elementos UI
const connectWalletBtn = document.getElementById('connectWallet');
const walletBalanceSpan = document.getElementById('walletBalance');
const networkNameSpan = document.getElementById('networkName');
const nftGrid = document.getElementById('nftGrid');
const mintForm = document.getElementById('mintForm');
const nftModal = document.getElementById('nftModal') ? new bootstrap.Modal('#nftModal') : null;
const transactionModal = document.getElementById('transactionModal') ? new bootstrap.Modal('#transactionModal') : null;

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

// ================== FUNCIONES MEJORADAS ================== //

async function setupNetwork() {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
        throw new Error("MetaMask no está instalado o no se detectó correctamente");
    }

    try {
        let chainId;
        try {
            chainId = await window.ethereum.request({ method: 'eth_chainId' });
        } catch (e) {
            // Fallback para wallets que no soportan eth_chainId
            const netVersion = await window.ethereum.request({ method: 'net_version' });
            chainId = `0x${parseInt(netVersion).toString(16)}`;
        }

        if (chainId !== SEPOLIA_CONFIG.chainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: SEPOLIA_CONFIG.chainId }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [SEPOLIA_CONFIG],
                    });
                } else {
                    throw switchError;
                }
            }
        }
        return true;
    } catch (error) {
        console.error("Error configurando red:", error);
        throw error;
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        showError('Por favor instala MetaMask o usa un navegador con soporte para Ethereum');
        return false;
    }

    try {
        await setupNetwork();
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        }).catch(err => {
            if (err.code === 4001) {
                throw new Error("Cancelaste la conexión con MetaMask");
            }
            throw err;
        });

        if (!accounts || accounts.length === 0) {
            throw new Error("No se obtuvieron cuentas de MetaMask");
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = accounts[0];
        
        if (!contractAddress || !contractABI) {
            throw new Error("Configuración del contrato no encontrada");
        }
        
        nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        updateWalletUI();
        await updateNetworkInfo();
        await loadNFTs();
        
        return true;
    } catch (error) {
        console.error("Error conectando wallet:", error);
        let errorMessage = "Error al conectar la wallet";
        
        if (error.message.includes("denied account access")) {
            errorMessage = "Cancelaste la conexión con MetaMask";
        } else if (error.message.includes("No se pudo configurar")) {
            errorMessage = error.message;
        } else if (error.code === -32002) {
            errorMessage = "Ya hay una solicitud pendiente en MetaMask";
        }
        
        showError(errorMessage);
        return false;
    }
}

function handleConnectionError(error) {
    let message = "Error conectando la wallet";
    
    if (error.code === 4001) {
        message = "Cancelaste la conexión con MetaMask";
    } else if (error.code === -32002) {
        message = "Ya hay una solicitud pendiente en MetaMask";
    } else if (error.message.includes("Network")) {
        message = "Por favor cambia a la red Sepolia en MetaMask";
    } else {
        message = error.message || message;
    }
    
    showError(message);
}

function updateWalletUI() {
    if (!connectWalletBtn) return;

    if (userAddress) {
        connectWalletBtn.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${shortenAddress(userAddress)}
        `;
        connectWalletBtn.classList.add('connected');
    } else {
        connectWalletBtn.innerHTML = `
            <i class="fas fa-wallet me-2"></i>
            Conectar Wallet
        `;
        connectWalletBtn.classList.remove('connected');
    }
}

// ================== FUNCIONES PRINCIPALES ================== //

async function loadNFTs() {
    if (!nftContract) return;

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
        return await response.json();
    } catch (error) {
        console.warn("Error cargando metadatos:", error);
        return {};
    }
}

function renderNFTs(nfts) {
    if (!nftGrid) return;

    if (nfts.length === 0) {
        nftGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                <h4>No hay NFTs disponibles</h4>
                <p class="text-muted">Sé el primero en crear un NFT</p>
            </div>
        `;
        return;
    }

    nftGrid.innerHTML = nfts.map(nft => `
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

    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const tokenId = btn.getAttribute('data-id');
            const nft = nfts.find(n => n.id == tokenId);
            if (nft) await buyNFT(nft.id, nft.price);
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
        setTimeout(() => {
            transactionModal.hide();
            loadNFTs();
        }, 2000);
    } catch (error) {
        console.error("Error comprando NFT:", error);
        showError(`Error al comprar: ${error.reason || error.message}`);
        transactionModal.hide();
    }
}

// ================== FUNCIONES AUXILIARES ================== //

function showLoadingState() {
    if (nftGrid) {
        nftGrid.innerHTML = `
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
    if (nftGrid) {
        nftGrid.innerHTML = `
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
        transactionModal.show();
    }
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
    alertDiv.style.zIndex = '1100';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function shortenAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

async function updateNetworkInfo() {
    if (!provider || !userAddress || !walletBalanceSpan || !networkNameSpan) return;
    
    try {
        const [balance, network] = await Promise.all([
            provider.getBalance(userAddress),
            provider.getNetwork()
        ]);
        
        walletBalanceSpan.textContent = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
        networkNameSpan.textContent = network.name === 'unknown' ? 'Sepolia' : network.name;
    } catch (error) {
        console.error("Error actualizando info de red:", error);
    }
}

// ================== INICIALIZACIÓN ================== //

function setupEventListeners() {
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }

    if (mintForm) {
        mintForm.addEventListener('submit', async (e) => {
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
                mintForm.reset();
                setTimeout(() => {
                    transactionModal.hide();
                    loadNFTs();
                }, 2000);
            } catch (error) {
                console.error("Error creando NFT:", error);
                showError(`Error al crear NFT: ${error.reason || error.message}`);
                transactionModal.hide();
            }
        });
    }
}

async function init() {
    try {
        // Verificar dependencias
        if (typeof ethers === 'undefined') {
            throw new Error("ethers.js no está cargado");
        }

        if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
            throw new Error("Configuración del contrato no encontrada");
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
        console.error("Error inicializando:", error);
        showError("Error al iniciar la aplicación: " + error.message);
    }
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('DOMContentLoaded', init);
}

// Escuchar cambios en MetaMask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        userAddress = accounts[0] || null;
        updateWalletUI();
        if (!accounts.length) showErrorState("Wallet desconectada");
        else loadNFTs().catch(console.error);
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}