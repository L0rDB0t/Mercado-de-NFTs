🌌 GalaxiaNFT Marketplace
¡Explora el universo de los NFTs en la blockchain!

🚀 Demo en Vivo
👉 Visitar GalaxiaNFT Marketplace

✨ Características Principales
🔗 Conexión de wallet con MetaMask integrada

🖼️ Galería interactiva de NFTs con temática espacial

🛒 Sistema de compra y venta en la red Sepolia

🎨 Creación de NFTs con subida automática a IPFS

📱 Diseño responsive, optimizado para todos los dispositivos

🌑 Tema oscuro con elegantes efectos de neón

🪐 Cómo Explorar esta Galaxia
Requisitos Previos
Extensión MetaMask instalada

Fondos de prueba en Sepolia (Obtén ETH de prueba aquí)

Pasos Iniciales
Visita 👉 https://mercado-de-nf-ts.vercel.app/

Conecta tu wallet usando el botón en la esquina superior derecha.

Explora la galería de NFTs disponibles.

Compra NFTs o crea y sube tus propios tokens.

🎨 Diseño Galáctico
mermaid
Copiar
Editar
graph TD
    A[Página Principal] --> B[Galería de NFTs]
    A --> C[Formulario de Creación]
    B --> D[Modal de Detalles de NFT]
    D --> E[Compra de NFT]
    C --> F[Mint de Nuevo NFT]
🌟 Código Destacado
javascript
Copiar
Editar
// Función para comprar un NFT
async function buyNFT(tokenId, price) {
  const tx = await contract.buyNFT(tokenId, {
    value: ethers.utils.parseEther(price.toString())
  });
  await tx.wait();
  showSuccess("¡NFT adquirido con éxito!");
}
📡 Información del Contrato
Red Blockchain: Sepolia Testnet

Contrato inteligente: 0x6aa8d26ecc5f79261f1c4b2de4a6510ac945424d

Explorador: Ver en Etherscan

🛸 Roadmap Futuro
✅ Sistema de compra y minting de NFTs

🚀 Sistema de subastas descentralizadas

🎨 Colecciones temáticas exclusivas

🔗 Integración con múltiples wallets

🕹️ Gamificación: logros, niveles y recompensas

👽 Contribuciones Intergalácticas
¡Las contribuciones son muy bienvenidas! 🚀

Haz un fork del repositorio.

Crea tu rama:

bash
Copiar
Editar
git checkout -b feature/nueva-funcionalidad
Realiza tus cambios y haz commit:

bash
Copiar
Editar
git commit -m "Agrega nueva funcionalidad interestelar 🚀"
Haz push a tu rama:

bash
Copiar
Editar
git push origin feature/nueva-funcionalidad
Abre un Pull Request 🚀

📜 Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más información.

🚀 ¿Listo para explorar el universo NFT?
👉 ¡Lánzate a GalaxiaNFT!
