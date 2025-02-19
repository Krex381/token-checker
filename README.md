# 🚀 Discord Token Checker Tool  

## 🔍 Features  

- **Multi-Threading Support**: Fast token checking with 1-100 threads  
- **Comprehensive Token Analysis**:  
  - Account Details  
  - Nitro Status & History  
  - Boost Status & Badges  
  - Payment Methods  
  - Account Badges  
  - Creation Date  

## 📋 Requirements  

- Node.js (v14 or later)  
- NPM (Node Package Manager)  
- Internet Connection  

## 🚀 Installation  

1. Clone or download the repository:  
```bash
git clone https://github.com/Krex381/token-checker.git
cd token-checker
```

2. Install dependencies:  
```bash
npm install
```

3. Create a `tokens.txt` file and add your tokens, one per line.  

## 💻 Usage  

To start the program:  
```bash
node index.js
```

## ⚙️ Configuration  

You can customize the following settings in the `CONFIG` object:  

```javascript
{
    retryLimit: 3,        // Retry limit for failed attempts
    requestDelay: 1500,   // Delay between requests (ms)
    timeout: 5000,        // Request timeout (ms)
    saveValid: true       // Save valid tokens
}
```

## 📊 Output Details  

For each token, the following details are checked:  

- 👤 **User Information**  
  - Username & ID  
  - Email & Verification Status  

- 🎮 **Discord Features**  
  - Nitro Membership  
  - Boost Status  
  - Account Badges  

- 💳 **Payment Information**  
  - Registered Payment Methods  
  - Payment Status  

## ⚠️ Security Warnings  

- Keep your tokens secure  
- Be mindful of rate limits  
- Avoid using too many threads at once  

## 📝 Example Output  

```
[01/50] VALID TOKEN
User: example#0000 (123456789)
Email: example@mail.com [Verified]
Nitro: Nitro | Boost Badge: 1 Month Booster | Badges: Early Supporter
Boosts: 1 | Payments: Credit Card (Valid)
Created: Jan 1, 2024 (30d 5h ago)
```

## 🤝 Contributing  

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/NewFeature`)  
3. Commit your changes (`git commit -am 'Added a new feature'`)  
4. Push the branch (`git push origin feature/NewFeature`)  
5. Create a Pull Request  

## 📜 License  

This project is licensed under the ISC License.  

## ⭐ Developer  

**Krex**  
- GitHub: [@Krex381](https://github.com/Krex381)


## 🔗 Discord

**Development Server**
- Discord Link: [Dark Coders](https://discord.gg/2UEs5WDZA2)
