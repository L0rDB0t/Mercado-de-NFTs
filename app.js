// Verificación inicial del entorno
if (typeof window === 'undefined') {
    throw new Error("Este código debe ejecutarse en el navegador");
}

// Verificación de dependencias
if (typeof ethers === 'undefined') {
    throw new Error("ethers.js no está cargado correctamente");
}
if (typeof bootstrap === 'undefined') {
    console.warn("Bootstrap no está cargado correctamente");
}

// Elementos UI - con verificaciones de existencia
const connectWalletBtn = document.getElementById('connectWallet');
const walletBalanceSpan = document.getElementById('walletBalance');
const networkNameSpan = document.getElementById('networkName');
const nftGrid = document.getElementById('nftGrid');
const mintForm = document.getElementById('mintForm');

// Inicialización segura de modales
let nftModal, transactionModal;
try {
    nftModal = document.getElementById('nftModal') ? new bootstrap.Modal('#nftModal') : null;
    transactionModal = document.getElementById('transactionModal') ? new bootstrap.Modal('#transactionModal') : null;
} catch (e) {
    console.error("Error inicializando modales:", e);
}

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

// ================== FUNCIONES DE CONEXIÓN MEJORADAS ================== //

async function setupNetwork() {
    if (!window.ethereum) {
        throw new Error("MetaMask no instalado");
    }
    
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
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
        showError('Por favor instala MetaMask');
        return false;
    }

    try {
        await setupNetwork();
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = accounts[0];
        
        // Verificación adicional del contrato
        if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
            throw new Error("Configuración del contrato incompleta");
        }
        
        nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        updateWalletUI();
        await updateNetworkInfo();
        await loadNFTs();
        
        return true;
    } catch (error) {
        console.error("Error conectando wallet:", error);
        handleConnectionError(error);
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

    const shortenedAddress = userAddress 
        ? `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`
        : '';
    
    connectWalletBtn.innerHTML = userAddress
        ? `<i class="fas fa-check-circle me-2"></i>${shortenedAddress}`
        : `<i class="fas fa-wallet me-2"></i>Conectar Wallet`;
        
    userAddress 
        ? connectWalletBtn.classList.add('connected')
        : connectWalletBtn.classList.remove('connected');
}

// ================== FUNCIONES PRINCIPALES CON MEJOR MANEJO DE ERRORES ================== //

async function loadNFTs() {
    if (!nftContract || !nftGrid) return;

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
        return {};
    }
}

function renderNFTs(nfts) {
    if (!nftGrid) return;

    nftGrid.innerHTML = nfts.length === 0
        ? `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                <h4>No hay NFTs disponibles</h4>
                <p class="text-muted">Sé el primero en crear un NFT</p>
            </div>
        `
        : nfts.map(nft => `
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
                                ${nft.forSale 
                                    ? `<button class="btn btn-sm btn-primary buy-btn" data-id="${nft.id}">
                                        <i class="fas fa-shopping-cart me-1"></i> Comprar
                                      </button>` 
                                    : `<span class="badge bg-secondary">Vendido</span>`
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

    // Agregar event listeners de manera segura
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const tokenId = btn.getAttribute('data-id');
            const nft = nfts.find(n => n.id == tokenId);
            if (nft) await buyNFT(nft.id, nft.price);
        });
    });
}

// ================== FUNCIONES AUXILIARES MEJORADAS ================== //

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
                <button class="btn btn-primary mt-3" onclick="window.location.reload()">
                    <i class="fas fa-sync-alt me-2"></i> Reintentar
                </button>
            </div>
        `;
    }
}

function showTransactionModal(message, txHash = null) {
    if (!transactionModal) return;
    
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
    try {
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
    } catch (e) {
        console.error("Error mostrando mensaje:", e);
    }
}

function shortenAddress(address) {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
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

// ================== MANEJO SEGURO DE LOCALSTORAGE ================== //

function safeLocalStorageGet(key) {
    try {
        return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (e) {
        console.warn("Error accediendo a localStorage:", e);
        return null;
    }
}

function safeLocalStorageSet(key, value) {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    } catch (e) {
        console.warn("Error guardando en localStorage:", e);
    }
}

// ================== INICIALIZACIÓN MEJORADA ================== //

function setupEventListeners() {
    // Conectar wallet
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }

    // Mint form
    if (mintForm) {
        mintForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!userAddress) {
                showError("Conecta tu wallet primero");
                return;
            }

            const name = document.getElementById('nftName')?.value;
            const description = document.getElementById('nftDescription')?.value;
            const imageUrl = document.getElementById('nftImage')?.value;
            const price = document.getElementById('nftPrice')?.value;

            if (!name || !description || !imageUrl || !price) {
                showError("Por favor completa todos los campos");
                return;
            }

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
        // Verificar conexión existente
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                userAddress = accounts[0];
                
                if (typeof contractAddress !== 'undefined' && typeof contractABI !== 'undefined') {
                    nftContract = new ethers.Contract(contractAddress, contractABI, signer);
                    updateWalletUI();
                    await updateNetworkInfo();
                }
            }
        }

        setupEventListeners();
        await loadNFTs();
    } catch (error) {
        console.error("Error inicializando la app:", error);
        showError("Error al iniciar la aplicación");
    }
}

// Iniciar la aplicación de manera segura
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 1);
} else {
    document.addEventListener('DOMContentLoaded', init);
}

// Escuchar cambios en MetaMask de manera segura
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        userAddress = accounts[0] || null;
        updateWalletUI();
        if (!accounts.length) {
            showErrorState("Wallet desconectada");
        } else {
            loadNFTs().catch(console.error);
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}