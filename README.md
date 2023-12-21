# Smart Rings Protocol - API

## Overview

The Smart Rings Protocol - API is a critical component in the Smart Rings ecosystem, designed to interact with the WebApp. Its primary functions are to generate signatures and verify solvency proofs. The custom signature generation repository is in a separate private repository, reserved for future projects. It's currently awaiting an audit to ensure its security and reliability before being integrated into upcoming projects.

## Features

- **Signature Generation**: Enables the WebApp to generate cryptographic signatures.
- **Solvency Proof Verification**: Assists in verifying the proof of solvency, ensuring the integrity and trustworthiness of transactions.

## Security Notice

### Important
The current implementation of the Smart Rings Protocol - API requires users to input their private keys directly. This input is then transmitted over an unencrypted channel. Given the sensitive nature of private keys, this method poses significant security risks if used in a production environment. As such, it is highly recommended to use burner private keys (keys created specifically for testing and without access to actual funds or valuable assets) when interacting with this API.

### Recommendations
- **Limited Use**: This API should only be used for testing purposes.
- **Burner Keys**: It is highly recommended to use burner private keys (keys created specifically for testing and without access to actual funds or valuable assets).
- **No Production Use**: Under no circumstances should this API be used with private keys associated with real or valuable assets in a production environment.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v20.5.0 or higher)
- [npm](https://www.npmjs.com/) (v10.19.0 or higher)
  
### Installation
1. Clone the repository.
2. Navigate to the project directory.
3. Install the dependencies.
```bash
npm install
```

### Usage
1. Start the server.
```bash
npm start
```

## Contact

If needed, you can contact the team at `contact@cypherlab.fr`
