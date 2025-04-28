const { fetchEnsAddress } = require("wagmi/actions");

// Configuración del contrato
const contractAddress = "0x6aa8d26ecc5f79261f1c4b2de4a6510ac945424d";
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "buyNFT",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fromTokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_toTokenId",
				"type": "uint256"
			}
		],
		"name": "BatchMetadataUpdate",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "listNFTForSale",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "MetadataUpdate",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "metadataURI",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "mintNFT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "NFTListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "metadataURI",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "NFTMinted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "NFTSold",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawFees",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getNFTDetails",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "metadataURI",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "forSale",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserNFTs",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "listingFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Elementos UI
const connectWalletBtn = document.getElementById('connectWallet');
const walletBalanceSpan = document.getElementById('walletBalance');
const networkNameSpan = document.getElementById('networkName');
const nftGrid = document.getElementById('nftGrid');
const mintForm = document.getElementById('mintForm');
const transactionModal = new bootstrap.Modal(document.getElementById('transactionModal'));
const modalMessage = document.getElementById('modalMessage');
const txHashLink = document.getElementById('txHashLink');
const nftModal = new bootstrap.Modal(document.getElementById('nftModal'));

// Variables globales
let nftContract;
let provider;
let signer;
let userAddress;

// Configuración de la red Sepolia
const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7',
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
});

async function initializeApp() {
  if (window.ethereum) {
    try {
      // Verificar si hay una wallet conectada
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        await handleWalletConnected(accounts[0]);
      }
      
      // Configurar listeners de eventos
      setupEventListeners();
      
    } catch (error) {
      console.error("Error inicializando la aplicación:", error);
      showError("Error al inicializar la aplicación");
    }
  } else {
    showError("MetaMask no está instalado. Por favor instálalo para continuar.");
  }
}

// Función principal para conectar wallet
async function connectWallet() {
  if (!window.ethereum) {
    alert('Por favor instala MetaMask desde https://metamask.io/');
    return;
  }

  try {
    // 1. Verificar/configurar red Sepolia
    await verifyNetwork();
    
    // 2. Solicitar acceso a la cuenta
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    // 3. Inicializar la conexión
    await handleWalletConnected(accounts[0]);
    
  } catch (error) {
    handleConnectionError(error);
  }
}

// Verificar y configurar red Sepolia
async function verifyNetwork() {
  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (currentChainId !== SEPOLIA_CONFIG.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CONFIG.chainId }],
        });
      } catch (switchError) {
        // Si la red no está añadida
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG]
          });
        } else {
          throw switchError;
        }
      }
    }
  } catch (error) {
    console.error("Error configurando red Sepolia:", error);
    throw new Error("Por favor configura manualmente la red Sepolia en MetaMask");
  }
}

// Manejar conexión exitosa
async function handleWalletConnected(account) {
  userAddress = account;
  
  // Inicializar provider y contrato
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  nftContract = new ethers.Contract(contractAddress, contractABI, signer);
  
  // Actualizar UI
  updateWalletUI();
  await updateNetworkInfo();
  await loadNFTs();
  
  // Configurar listeners de eventos de MetaMask
  setupMetaMaskEventListeners();
}

// Manejar errores de conexión
function handleConnectionError(error) {
  console.error("Error conectando con MetaMask:", error);
  
  userAddress = null;
  updateWalletUI();
  
  if (error.code === 4001) {
    showError("Cancelaste la conexión con MetaMask");
  } else if (error.code === -32002) {
    showError("Ya hay una solicitud de conexión pendiente");
  } else {
    showError(`Error de conexión: ${error.message || "Error desconocido"}`);
  }
}

// Actualizar UI de la wallet
function updateWalletUI() {
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

// Configurar listeners de eventos de MetaMask
function setupMetaMaskEventListeners() {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      // Wallet desconectada
      userAddress = null;
      updateWalletUI();
      showErrorState("Wallet desconectada");
    } else {
      // Cuenta cambiada
      userAddress = accounts[0];
      updateWalletUI();
      updateNetworkInfo();
      loadNFTs();
    }
  });
  
  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
}

// Acortar dirección de wallet
function shortenAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Actualizar información de red
async function updateNetworkInfo() {
  try {
    if (!provider || !userAddress) return;
    
    const balance = await provider.getBalance(userAddress);
    const balanceInEth = ethers.utils.formatEther(balance);
    walletBalanceSpan.textContent = parseFloat(balanceInEth).toFixed(4);
    
    const network = await provider.getNetwork();
    networkNameSpan.textContent = network.name === 'unknown' ? 'Sepolia' : network.name;
  } catch (error) {
    console.error("Error actualizando info de red:", error);
  }
}

// Mostrar error en UI
function showError(message) {
  const errorAlert = document.createElement('div');
  errorAlert.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
  errorAlert.style.zIndex = '1100';
  errorAlert.style.maxWidth = '400px';
  errorAlert.innerHTML = `
    <i class="fas fa-exclamation-circle me-2"></i>
    ${message}
    <button type="button" class="btn-close btn-close-white float-end" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(errorAlert);
  
  setTimeout(() => {
    errorAlert.remove();
  }, 5000);
}

// Configurar event listeners de la aplicación
function setupEventListeners() {
    connectWalletBtn.addEventListener('click', connectWallet);
    
    mintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!userAddress) {
            alert('Conecta tu wallet primero');
            return;
        }
        
        const name = document.getElementById('nftName').value;
        const description = document.getElementById('nftDescription').value;
        const imageUrl = document.getElementById('nftImage').value;
        const price = document.getElementById('nftPrice').value;
        
        try {
            showTransactionModal('Preparando creación de NFT...');
            
            const tokenURI = JSON.stringify({ 
                name, 
                description, 
                image: imageUrl,
                external_url: "https://mercado-de-nf-ts.vercel.app/"
            });
            
            const tx = await nftContract.mintNFT(
                tokenURI, 
                ethers.utils.parseEther(price), 
                { value: ethers.utils.parseEther("0.001") }
            );
            
            txHashLink.href = `https://sepolia.etherscan.io/tx/${tx.hash}`;
            txHashLink.textContent = `Ver transacción #${tx.hash.substring(0, 8)}...`;
            txHashLink.classList.remove('d-none');
            modalMessage.textContent = 'Esperando confirmación...';
            
            await tx.wait();
            
            modalMessage.textContent = '¡NFT creado exitosamente!';
            txHashLink.classList.add('d-none');
            
            setTimeout(() => {
                transactionModal.hide();
                mintForm.reset();
                loadNFTs();
            }, 2000);
            
        } catch (error) {
            console.error("Error al crear NFT:", error);
            showError(`Error al crear NFT: ${error.reason || error.message}`);
            transactionModal.hide();
        }
    });
}

function showTransactionModal(message) {
    modalMessage.textContent = message;
    txHashLink.classList.add('d-none');
    transactionModal.show();
}

function showError(message) {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
    errorAlert.style.zIndex = '1100';
    errorAlert.style.maxWidth = '400px';
    errorAlert.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close btn-close-white float-end" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(errorAlert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorAlert.remove();
    }, 5000);
}

// Escuchar cambios de cuenta y red
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            userAddress = null;
            updateWalletUI();
            showErrorState("Wallet desconectada");
        } else {
            userAddress = accounts[0];
            updateWalletUI();
            updateNetworkInfo();
            loadNFTs();
        }
    });
    
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}
// Función mejorada para conectar wallet
async function connectWallet() {
    if (!window.ethereum) {
        alert('Por favor instala MetaMask desde https://metamask.io/');
        return;
    }

    try {
        // Solicitar acceso a las cuentas
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        userAddress = accounts[0];
        updateWalletUI();
        
        // Inicializar el provider y contrato
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Actualizar información de red
        await updateNetworkInfo();
        
        // Cargar NFTs
        await loadNFTs();
        
        console.log("Wallet conectada:", userAddress);
        
    } catch (error) {
        console.error("Error al conectar wallet:", error);
        
        // Mensajes de error específicos
        if (error.code === 4001) {
            alert("Cancelaste la conexión. Por favor conecta tu wallet para continuar.");
        } else {
            alert(`Error al conectar: ${error.message}`);
        }
    }
}

// Función mejorada para actualizar la UI
function updateWalletUI() {
    const walletBtn = document.getElementById('connectWallet');
    if (userAddress) {
        walletBtn.innerHTML = `<i class="fas fa-check-circle me-2"></i>${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        walletBtn.classList.add('connected');
    } else {
        walletBtn.innerHTML = '<i class="fas fa-wallet me-2"></i>Conectar Wallet';
        walletBtn.classList.remove('connected');
    }
}
// Verificar y cambiar a Sepolia si es necesario
async function checkNetwork() {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const sepoliaChainId = '0xaa36a7'; // ID de Sepolia
    
    if (chainId !== sepoliaChainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: sepoliaChainId }],
            });
        } catch (error) {
            // Si la red no está añadida, agregarla
            if (error.code === 4902) {
                await addSepoliaNetwork();
            }
        }
    }
}

// Añadir red Sepolia a MetaMask
async function addSepoliaNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia',
                nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
        });
    } catch (error) {
        console.error("Error al añadir red Sepolia:", error);
    }
}

// Modifica la función connectWallet para incluir la verificación de red
async function connectWallet() {
    if (!window.ethereum) {
        alert('Por favor instala MetaMask');
        return;
    }

    try {
        await checkNetwork(); // <-- Verificar red primero
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // ... resto del código
    } catch (error) {
        // ... manejo de errores
    }
}