Descripción
GalaxiaNFT es un marketplace descentralizado para comprar, vender y crear NFTs en la red de prueba Sepolia. Este proyecto permite a los usuarios:

Conectar sus wallets (MetaMask u otras compatibles con Ethereum)

Explorar una colección de NFTs disponibles

Comprar NFTs listados en el mercado

Crear y listar nuevos NFTs

Gestionar sus propios NFTs

Tecnologías Utilizadas
Frontend: HTML5, CSS3, JavaScript, Bootstrap 5

Blockchain: Ethereum (Red Sepolia), Ethers.js

Smart Contracts: ERC-721 (NFT estándar)

Herramientas: MetaMask, Pinata (para almacenamiento IPFS)

Configuración del Proyecto
Requisitos Previos
MetaMask instalado en tu navegador

Fondos de prueba en la red Sepolia (puedes obtenerlos de un faucet como Sepolia Faucet)

Node.js (para desarrollo local)

Instalación
Clona este repositorio:

bash
git clone https://github.com/tu-usuario/galaxia-nft.git
cd galaxia-nft
Abre el archivo index.html en tu navegador o utiliza un servidor local como Live Server.

Uso
Conectar Wallet: Haz clic en el botón "Conectar Wallet" para vincular tu wallet de MetaMask.

Explorar NFTs: Navega por la colección de NFTs disponibles en la sección principal.

Comprar NFTs: Haz clic en cualquier NFT para ver detalles y la opción de compra.

Crear NFTs: Completa el formulario en la sección "Crear Nuevo NFT" para mintear tu propio NFT.

Configuración del Contrato Inteligente
El proyecto está configurado para interactuar con un contrato inteligente desplegado en Sepolia. Puedes personalizarlo:

Reemplaza contractAddress en el código con la dirección de tu propio contrato.

Actualiza contractABI con la ABI de tu contrato si has realizado modificaciones.

Estructura del Proyecto
galaxia-nft/
│── index.html          # Página principal
│── app.js              # Lógica principal de la aplicación
│── README.md           # Este archivo

Contribución
Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios que te gustaría hacer o envía un pull request.

Licencia
MIT

Contacto
Para preguntas o soporte, por favor contacta al desarrollador o abre un issue en el repositorio.

Nota: Este proyecto está diseñado para la red de prueba Sepolia. No utilices fondos reales.
