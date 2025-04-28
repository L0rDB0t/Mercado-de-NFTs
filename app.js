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

// Inicialización
window.addEventListener('DOMContentLoaded', async () => {
    await initWeb3();
    setupEventListeners();
});

async function initWeb3() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Verificar conexión existente
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            userAddress = accounts[0];
            updateWalletUI();
            await updateNetworkInfo();
            await loadNFTs();
        }
    } else {
        alert('Por favor instala MetaMask para usar esta aplicación');
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        alert('MetaMask no está instalado');
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];
        updateWalletUI();
        await initWeb3();
    } catch (error) {
        console.error("Error al conectar la wallet:", error);
        showError("Error al conectar: " + (error.message || error.reason || "Error desconocido"));
    }
}

function updateWalletUI() {
    if (userAddress) {
        connectWalletBtn.innerHTML = `<i class="fas fa-check-circle me-2"></i>${shortenAddress(userAddress)}`;
        connectWalletBtn.classList.add('connected');
    } else {
        connectWalletBtn.innerHTML = '<i class="fas fa-wallet me-2"></i>Conectar Wallet';
        connectWalletBtn.classList.remove('connected');
    }
}

function shortenAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

async function updateNetworkInfo() {
    try {
        const balance = await provider.getBalance(userAddress);
        const balanceInEth = ethers.utils.formatEther(balance);
        walletBalanceSpan.textContent = parseFloat(balanceInEth).toFixed(4);
        
        const network = await provider.getNetwork();
        networkNameSpan.textContent = network.name === 'unknown' ? 'Sepolia' : network.name;
    } catch (error) {
        console.error("Error al actualizar info de red:", error);
    }
}

async function loadNFTs() {
    try {
        showLoadingState();
        
        const totalSupply = await nftContract.tokenCounter();
        const nfts = [];
        
        for (let i = 1; i <= totalSupply; i++) {
            try {
                const nftDetails = await nftContract.getNFTDetails(i);
                const priceInEth = ethers.utils.formatEther(nftDetails.price);
                
                let metadata = { name: `NFT #${i}`, description: "Descripción no disponible", image: "https://via.placeholder.com/300" };
                
                try {
                    const response = await fetch(nftDetails.metadataURI);
                    if (response.ok) {
                        metadata = await response.json();
                    }
                } catch (e) {
                    console.warn(`Error cargando metadatos para NFT ${i}:`, e);
                }
                
                nfts.push({
                    id: i,
                    name: metadata.name,
                    description: metadata.description,
                    price: priceInEth,
                    image: metadata.image,
                    forSale: nftDetails.forSale,
                    owner: nftDetails.owner,
                    creator: nftDetails.creator
                });
            } catch (error) {
                console.error(`Error cargando NFT ${i}:`, error);
            }
        }
        
        renderNFTs(nfts);
    } catch (error) {
        console.error("Error al cargar NFTs:", error);
        showErrorState("Error al cargar los NFTs");
    }
}

function showLoadingState() {
    nftGrid.innerHTML = `
        <div class="col-12">
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Cargando colección de NFTs...</h3>
                <p class="text-muted">Por favor espera mientras cargamos los NFTs disponibles</p>
            </div>
        </div>
    `;
}

function showErrorState(message) {
    nftGrid.innerHTML = `
        <div class="col-12">
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle text-danger"></i>
                <h3>${message}</h3>
                <button class="btn btn-connect mt-3" onclick="location.reload()">
                    <i class="fas fa-sync-alt me-2"></i>Reintentar
                </button>
            </div>
        </div>
    `;
}

function renderNFTs(nfts) {
    if (nfts.length === 0) {
        nftGrid.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No hay NFTs disponibles</h3>
                    <p class="text-muted">Sé el primero en crear un NFT</p>
                </div>
            </div>
        `;
        return;
    }
    
    nftGrid.innerHTML = '';
    
    nfts.forEach(nft => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';
        col.innerHTML = `
            <div class="nft-card h-100" data-id="${nft.id}">
                <img src="${nft.image}" alt="${nft.name}" class="nft-img" onerror="this.src='https://via.placeholder.com/300'">
                <div class="p-3 d-flex flex-column h-100">
                    <h5 class="mb-2">${nft.name}</h5>
                    <p class="text-muted flex-grow-1">${nft.description.substring(0, 100)}${nft.description.length > 100 ? '...' : ''}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="price-tag">${parseFloat(nft.price).toFixed(3)} ETH</span>
                            ${nft.forSale ? 
                                `<button class="btn btn-sm btn-connect buy-btn">
                                    <i class="fas fa-shopping-cart me-1"></i>Comprar
                                </button>` :
                                `<span class="badge bg-secondary">Vendido</span>`
                            }
                        </div>
                        <small class="text-muted d-block"><i class="fas fa-user me-1"></i>${shortenAddress(nft.owner)}</small>
                    </div>
                </div>
            </div>
        `;
        nftGrid.appendChild(col);
        
        // Evento para ver detalles
        col.querySelector('.nft-card').addEventListener('click', (e) => {
            if (!e.target.classList.contains('buy-btn')) {
                showNFTDetails(nft);
            }
        });
        
        // Evento para comprar
        if (nft.forSale) {
            col.querySelector('.buy-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                buyNFT(nft.id, nft.price);
            });
        }
    });
}

function showNFTDetails(nft) {
    document.getElementById('nftModalImage').src = nft.image;
    document.getElementById('nftModalName').textContent = nft.name;
    document.getElementById('nftModalDescription').textContent = nft.description;
    document.getElementById('nftModalPrice').textContent = `${parseFloat(nft.price).toFixed(3)} ETH`;
    document.getElementById('nftModalStatus').textContent = nft.forSale ? 'En venta' : 'Vendido';
    document.getElementById('nftModalOwner').textContent = shortenAddress(nft.owner);
    document.getElementById('nftModalId').textContent = `#${nft.id}`;
    
    const buyBtn = document.getElementById('nftModalBuyBtn');
    if (nft.forSale) {
        buyBtn.style.display = 'block';
        buyBtn.onclick = () => {
            nftModal.hide();
            buyNFT(nft.id, nft.price);
        };
    } else {
        buyBtn.style.display = 'none';
    }
    
    nftModal.show();
}

async function buyNFT(tokenId, price) {
    if (!userAddress) {
        alert('Por favor conecta tu wallet primero');
        return;
    }
    
    try {
        showTransactionModal('Iniciando compra...');
        
        const tx = await nftContract.buyNFT(tokenId, { 
            value: ethers.utils.parseEther(price) 
        });
        
        txHashLink.href = `https://sepolia.etherscan.io/tx/${tx.hash}`;
        txHashLink.textContent = `Ver transacción #${tx.hash.substring(0, 8)}...`;
        txHashLink.classList.remove('d-none');
        modalMessage.textContent = 'Esperando confirmación...';
        
        await tx.wait();
        
        modalMessage.textContent = '¡Compra exitosa!';
        txHashLink.classList.add('d-none');
        
        setTimeout(() => {
            transactionModal.hide();
            loadNFTs();
        }, 2000);
        
    } catch (error) {
        console.error("Error al comprar NFT:", error);
        showError(`Error al comprar: ${error.reason || error.message}`);
        transactionModal.hide();
    }
}

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