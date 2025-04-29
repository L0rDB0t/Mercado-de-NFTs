// 1. Configuración inicial
const isVercel = window.location.hostname.includes('vercel.app');

// 2. Funciones básicas
function shortenAddress(address) {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
}

function showError(message) {
    console.error(message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
    errorDiv.style.zIndex = '1100';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// 3. Elementos UI
const ui = {
    connectWalletBtn: document.getElementById('connectWallet'),
    walletBalanceSpan: document.getElementById('walletBalance'),
    networkNameSpan: document.getElementById('networkName'),
    nftGrid: document.getElementById('nftGrid'),
    mintForm: document.getElementById('mintForm'),
    contractShort: document.getElementById('contractShort')
};

// 4. Variables de estado
let nftContract, provider, signer, userAddress;

// 5. Configuración de Sepolia
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

// 6. Función mejorada para cargar NFTs
async function loadNFTs() {
    if (!nftContract || !ui.nftGrid) {
        console.error('Contrato no inicializado o elemento nftGrid no encontrado');
        return;
    }

    try {
        // Mostrar estado de carga
        ui.nftGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando NFTs...</p>
            </div>
        `;

        // Obtener el contador de tokens
        const totalSupply = await nftContract.tokenCounter();
        console.log(`Total de NFTs en contrato: ${totalSupply}`);

        // Cargar detalles de cada NFT
        const nfts = [];
        for (let i = 1; i <= totalSupply; i++) {
            try {
                const nftDetails = await nftContract.getNFTDetails(i);
                console.log(`Detalles NFT ${i}:`, nftDetails);

                // Obtener metadatos
                let metadata = {};
                try {
                    const response = await fetch(nftDetails.metadataURI);
                    metadata = await response.json();
                    console.log(`Metadatos NFT ${i}:`, metadata);
                } catch (error) {
                    console.warn(`Error cargando metadatos NFT ${i}:`, error);
                    metadata = {
                        name: `NFT #${i}`,
                        description: "Descripción no disponible",
                        image: "https://via.placeholder.com/300"
                    };
                }

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
                console.error(`Error procesando NFT ${i}:`, error);
            }
        }

        // Renderizar NFTs
        renderNFTs(nfts);

    } catch (error) {
        console.error('Error general cargando NFTs:', error);
        showError('Error al cargar NFTs. Por favor recarga la página');
        ui.nftGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>Error al cargar NFTs</h4>
                <button class="btn btn-primary mt-3" onclick="window.location.reload()">
                    <i class="fas fa-sync-alt me-2"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// 7. Función para renderizar NFTs
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

    // Agregar event listeners a los botones de compra
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const tokenId = btn.getAttribute('data-id');
            const nft = nfts.find(n => n.id == tokenId);
            if (nft) {
                try {
                    await buyNFT(nft.id, nft.price);
                } catch (error) {
                    showError(`Error al comprar NFT: ${error.message}`);
                }
            }
        });
    });
}

// 8. Función para conectar wallet
async function connectWallet() {
    if (!window.ethereum) {
        showError('Por favor instala MetaMask');
        return false;
    }

    try {
        // Solicitar conexión
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        if (!accounts || accounts.length === 0) {
            throw new Error('No se obtuvieron cuentas');
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
        console.error('Error conectando wallet:', error);
        showError(error.message || 'Error al conectar la wallet');
        return false;
    }
}

// 9. Función para actualizar la UI de la wallet
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

// 10. Función para actualizar información de red
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

// 11. Inicialización
async function init() {
    try {
        // Verificar dependencias
        if (typeof ethers === 'undefined') {
            throw new Error('ethers.js no está cargado');
        }

        // Verificar configuración del contrato
        if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
            throw new Error('Configuración del contrato no encontrada');
        }

        // Mostrar dirección abreviada del contrato
        if (ui.contractShort) {
            ui.contractShort.textContent = shortenAddress(contractAddress);
        }

        // Configurar listeners de eventos
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
                    // Mostrar modal de transacción
                    const modal = new bootstrap.Modal('#transactionModal');
                    const modalBody = document.querySelector('#transactionModal .modal-body');
                    modalBody.innerHTML = `
                        <div class="text-center">
                            <div class="spinner-border text-primary mb-3" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <h5>Creando NFT...</h5>
                        </div>
                    `;
                    modal.show();

                    // Crear NFT
                    const tokenURI = JSON.stringify({ name, description, image: imageUrl });
                    const tx = await nftContract.mintNFT(
                        tokenURI, 
                        ethers.utils.parseEther(price),
                        { value: ethers.utils.parseEther("0.001") }
                    );

                    await tx.wait();

                    // Mostrar éxito
                    modalBody.innerHTML = `
                        <div class="text-center">
                            <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                            <h5>¡NFT creado exitosamente!</h5>
                            <a href="https://sepolia.etherscan.io/tx/${tx.hash}" 
                               target="_blank" class="text-decoration-none">
                                Ver transacción
                            </a>
                        </div>
                    `;

                    // Limpiar formulario y recargar NFTs
                    ui.mintForm.reset();
                    setTimeout(async () => {
                        modal.hide();
                        await loadNFTs();
                    }, 2000);

                } catch (error) {
                    console.error("Error creando NFT:", error);
                    showError(`Error al crear NFT: ${error.reason || error.message}`);
                }
            });
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

    } catch (error) {
        console.error('Error inicializando:', error);
        showError('Error al iniciar la aplicación: ' + error.message);
    }
}

// 12. Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'complete') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}

// 13. Escuchadores de eventos de MetaMask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        userAddress = accounts[0] || null;
        updateWalletUI();
        if (accounts.length > 0) {
            loadNFTs().catch(error => {
                console.error('Error recargando NFTs:', error);
            });
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}