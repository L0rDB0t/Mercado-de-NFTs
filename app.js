// 1. Bloqueo de localStorage en Vercel y polyfill seguro
const isVercel = window.location.hostname.includes('vercel.app');

const storage = {
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

if (isVercel) {
  Object.defineProperty(window, 'localStorage', {
    value: storage,
    writable: false
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: storage,
    writable: false
  });
}

// 2. Configuración y elementos UI
const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7',
  chainName: 'Sepolia Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

const ui = {
  connectWalletBtn: document.getElementById('connectWallet'),
  walletBalanceSpan: document.getElementById('walletBalance'),
  networkNameSpan: document.getElementById('networkName'),
  nftGrid: document.getElementById('nftGrid'),
  mintForm: document.getElementById('mintForm'),
  contractShort: document.getElementById('contractShort')
};

let nftContract, provider, signer, userAddress;

// 3. Funciones principales
async function setupNetwork() {
  if (!window.ethereum) throw new Error("MetaMask no detectado");
  
  try {
    let chainId;
    try {
      chainId = await window.ethereum.request({ method: 'eth_chainId' });
    } catch {
      const netVersion = await window.ethereum.request({ method: 'net_version' });
      chainId = `0x${parseInt(netVersion).toString(16)}`;
    }

    if (chainId !== SEPOLIA_CONFIG.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CONFIG.chainId }]
        });
      } catch (error) {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG]
          });
        } else {
          throw new Error("Por favor cambia manualmente a Sepolia");
        }
      }
    }
  } catch (error) {
    console.error("Error configurando red:", error);
    throw error;
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    showError("Instala MetaMask para continuar");
    return false;
  }

  try {
    await setupNetwork();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = accounts[0];
    nftContract = new ethers.Contract(contractAddress, contractABI, signer);
    
    updateWalletUI();
    await updateNetworkInfo();
    await loadNFTs();
    
    return true;
  } catch (error) {
    console.error("Error conectando wallet:", error);
    showError(error.message.includes("manualmente") ? error.message : "Error al conectar");
    return false;
  }
}

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

        // Actualización progresiva cada 5 NFTs
        if (i % 5 === 0 || i === totalSupply) {
          renderNFTs(nfts);
        }
      } catch (error) {
        console.warn(`Error cargando NFT ${i}:`, error);
      }
    }

    storage.setItem('nfts-cache', nfts);
  } catch (error) {
    console.error("Error cargando NFTs:", error);
    showErrorState("Error al cargar NFTs");
    
    // Mostrar caché si hay error
    const cachedNFTs = storage.getItem('nfts-cache') || [];
    if (cachedNFTs.length > 0) renderNFTs(cachedNFTs);
  }
}

function resolveImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/300';
  if (url.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
  }
  return url;
}

// 4. Funciones de UI
function renderNFTs(nfts) {
  if (!ui.nftGrid) return;

  ui.nftGrid.innerHTML = nfts.length > 0 ? nfts.map(nft => `
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
      e.preventDefault();
      const tokenId = btn.getAttribute('data-id');
      const nft = nfts.find(n => n.id == tokenId);
      if (nft) await buyNFT(nft.id, nft.price);
    });
  });
}

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

function updateWalletUI() {
  if (!ui.connectWalletBtn) return;

  ui.connectWalletBtn.innerHTML = userAddress ? `
    <i class="fas fa-check-circle me-2"></i>
    ${shortenAddress(userAddress)}
  ` : `
    <i class="fas fa-wallet me-2"></i>
    Conectar Wallet
  `;
  
  ui.connectWalletBtn.classList.toggle('connected', !!userAddress);
}

// 5. Inicialización
async function init() {
  try {
    if (!contractAddress || !contractABI) {
      throw new Error("Configuración del contrato no definida");
    }

    if (ui.contractShort) {
      ui.contractShort.textContent = `${contractAddress.substring(0, 6)}...${contractAddress.slice(-4)}`;
    }

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
    showError("Error al iniciar: " + error.message);
  }
}

// 6. Event listeners y funciones auxiliares
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

      const formData = new FormData(ui.mintForm);
      try {
        showTransactionModal("Creando NFT...");
        const tokenURI = JSON.stringify({
          name: formData.get('nftName'),
          description: formData.get('nftDescription'),
          image: formData.get('nftImage')
        });
        
        const tx = await nftContract.mintNFT(
          tokenURI, 
          ethers.utils.parseEther(formData.get('nftPrice')),
          { value: ethers.utils.parseEther("0.001") }
        );

        await tx.wait();
        showTransactionModal("¡NFT creado!", tx.hash);
        ui.mintForm.reset();
        
        setTimeout(async () => {
          if (transactionModal) transactionModal.hide();
          await loadNFTs();
        }, 2000);
      } catch (error) {
        console.error("Error creando NFT:", error);
        showError(`Error: ${error.reason || error.message}`);
        if (transactionModal) transactionModal.hide();
      }
    });
  }
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'complete') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}