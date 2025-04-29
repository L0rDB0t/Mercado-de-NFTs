// 1. Configuración inicial segura
console.log("Inicializando aplicación GalaxiaNFT...");

// 2. Sistema de almacenamiento alternativo (para evitar errores en Vercel)
const appStorage = {
    _data: {},
    getItem(key) {
        return this._data[key] || null;
    },
    setItem(key, value) {
        this._data[key] = value;
    },
    removeItem(key) {
        delete this._data[key];
    },
    clear() {
        this._data = {};
    }
};

// 3. Verificación segura de elementos del DOM
function getSafeElement(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Elemento no encontrado: ${id}`);
    return el;
}

// 4. Elementos UI
const ui = {
    connectWalletBtn: getSafeElement('connectWallet'),
    walletBalanceSpan: getSafeElement('walletBalance'),
    networkNameSpan: getSafeElement('networkName'),
    nftGrid: getSafeElement('nftGrid'),
    mintForm: getSafeElement('mintForm'),
    contractShort: getSafeElement('contractShort'),
    nftName: getSafeElement('nftName'),
    nftDescription: getSafeElement('nftDescription'),
    nftImage: getSafeElement('nftImage'),
    nftPrice: getSafeElement('nftPrice')
};

// 5. Variables de estado
let nftContract = null;
let provider = null;
let signer = null;
let userAddress = null;

// 6. Configuración de Sepolia
const SEPOLIA_CONFIG = {
    chainId: '0xaa36a7', // 11155111
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
};

// 7. Función para mostrar errores
function showError(message) {
    console.error(message);
    try {
        // Eliminar errores previos
        document.querySelectorAll('.custom-error').forEach(el => el.remove());
        
        // Crear nuevo mensaje
        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-error alert alert-danger position-fixed top-0 end-0 m-3';
        alertDiv.style.zIndex = '1100';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        document.body.appendChild(alertDiv);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => alertDiv.remove(), 5000);
    } catch (e) {
        console.error("Error mostrando mensaje de error:", e);
    }
}

// 8. Función para acortar direcciones
function shortenAddress(address) {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
}

// 9. Función para conectar wallet (versión mejorada)
async function connectWallet() {
    console.log("Intentando conectar wallet...");
    
    if (!window.ethereum) {
        showError('Por favor instala MetaMask');
        return false;
    }

    try {
        // Solicitar conexión de cuenta
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        if (!accounts || accounts.length === 0) {
            throw new Error('No se obtuvieron cuentas');
        }

        // Configurar provider
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = accounts[0];

        // Verificar configuración del contrato
        if (typeof contractAddress === 'undefined' || typeof contractABI === 'undefined') {
            throw new Error('Configuración del contrato no encontrada');
        }

        // Crear instancia del contrato con verificación de métodos
        nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Verificación esencial de métodos del contrato
        const requiredMethods = ['tokenCounter', 'getNFTDetails', 'buyNFT', 'mintNFT'];
        const missingMethods = requiredMethods.filter(method => !nftContract[method]);
        
        if (missingMethods.length > 0) {
            throw new Error(`El contrato no tiene los métodos requeridos: ${missingMethods.join(', ')}`);
        }

        // Actualizar UI
        updateWalletUI();
        await updateNetworkInfo();
        await loadNFTs();

        console.log("Wallet conectada correctamente");
        return true;

    } catch (error) {
        console.error('Error conectando wallet:', error);
        showError(error.message.includes('métodos requeridos') 
            ? 'Error en el contrato: Métodos faltantes. Verifica el ABI.'
            : `Error al conectar: ${error.message}`);
        return false;
    }
}

// 10. Función para cargar NFTs (con verificación de métodos)
async function loadNFTs() {
    console.log("Cargando NFTs...");
    
    if (!nftContract || !ui.nftGrid) {
        showError("Configuración incompleta para cargar NFTs");
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

        // Obtener total de NFTs
        const totalSupply = await nftContract.tokenCounter();
        console.log(`Total de NFTs encontrados: ${totalSupply}`);

        const nfts = [];
        for (let i = 1; i <= totalSupply; i++) {
            try {
                const nftDetails = await nftContract.getNFTDetails(i);
                console.log(`Detalles NFT ${i}:`, nftDetails);

                // Obtener metadatos
                let metadata = {};
                try {
                    if (nftDetails.metadataURI) {
                        const response = await fetch(nftDetails.metadataURI);
                        metadata = await response.json();
                    }
                } catch (error) {
                    console.warn(`Error cargando metadatos NFT ${i}:`, error);
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
                showError(`Error cargando NFT ${i}`);
            }
        }

        renderNFTs(nfts);

    } catch (error) {
        console.error("Error general cargando NFTs:", error);
        showError("Error al cargar NFTs. Por favor recarga la página");
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

// 11. Función para renderizar NFTs
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

    try {
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

        // Agregar event listeners para comprar
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

    } catch (error) {
        console.error("Error renderizando NFTs:", error);
        showError("Error al mostrar NFTs");
    }
}

// 12. Función para actualizar UI de wallet
function updateWalletUI() {
    if (!ui.connectWalletBtn) return;

    try {
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
    } catch (error) {
        console.error("Error actualizando UI de wallet:", error);
    }
}

// 13. Función para actualizar info de red
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

// 14. Función para comprar NFT
async function buyNFT(tokenId, price) {
    if (!userAddress) {
        showError("Conecta tu wallet primero");
        return;
    }

    if (!nftContract || !nftContract.buyNFT) {
        showError("Funcionalidad de compra no disponible");
        return;
    }

    try {
        const tx = await nftContract.buyNFT(tokenId, {
            value: ethers.utils.parseEther(price)
        });
        
        await tx.wait();
        showError("¡Compra exitosa!");
        await loadNFTs();
    } catch (error) {
        console.error("Error comprando NFT:", error);
        showError(`Error al comprar: ${error.reason || error.message}`);
    }
}

// 15. Inicialización de la aplicación
async function initApp() {
    console.log("Inicializando aplicación...");
    
    try {
        // Verificar dependencias
        if (typeof ethers === 'undefined') {
            throw new Error('La biblioteca ethers.js no está cargada');
        }

        // Mostrar dirección del contrato
        if (ui.contractShort && typeof contractAddress !== 'undefined') {
            ui.contractShort.textContent = shortenAddress(contractAddress);
        }

        // Configurar event listeners
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

                if (!nftContract || !nftContract.mintNFT) {
                    showError("Funcionalidad de creación no disponible");
                    return;
                }

                const name = ui.nftName?.value;
                const description = ui.nftDescription?.value;
                const imageUrl = ui.nftImage?.value;
                const price = ui.nftPrice?.value;

                if (!name || !description || !imageUrl || !price) {
                    showError("Por favor completa todos los campos");
                    return;
                }

                try {
                    const tokenURI = JSON.stringify({ name, description, image: imageUrl });
                    const tx = await nftContract.mintNFT(
                        tokenURI, 
                        ethers.utils.parseEther(price),
                        { value: ethers.utils.parseEther("0.001") }
                    );

                    await tx.wait();
                    showError("¡NFT creado exitosamente!");
                    ui.mintForm.reset();
                    await loadNFTs();
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
                
                if (typeof contractAddress !== 'undefined' && typeof contractABI !== 'undefined') {
                    nftContract = new ethers.Contract(contractAddress, contractABI, signer);
                    
                    // Verificar métodos esenciales
                    if (nftContract.tokenCounter && nftContract.getNFTDetails) {
                        updateWalletUI();
                        await updateNetworkInfo();
                        await loadNFTs();
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error inicializando aplicación:', error);
        showError('Error al iniciar: ' + error.message);
    }
}

// 16. Iniciar aplicación
if (document.readyState === 'complete') {
    initApp();
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}

// 17. Escuchadores de eventos de MetaMask
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