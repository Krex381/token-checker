# 🚀 Discord Token Checker Tool  

## 🔍 Features  

- **Multi-Threading Support**: Fast token checking with 1-100 threads  
- **Comprehensive Token Analysis**:  
  - Account Details  
  - Nitro Status & Subscription Tier (Bronze, Silver, Gold, etc.)
  - Boost Status, Available Boosts & Badges  
  - Payment Methods  
  - Account Badges  
  - Creation Date  
- **Real-time Progress Display**: Track checking progress as it happens
- **Smart Thread Management**: Automatically optimizes thread count based on tokens

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

OR simply run:
```bash
start.bat
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
  - Phone Verification Status

- 🎮 **Discord Features**  
  - Nitro Membership Type (Classic, Nitro, Basic)
  - Nitro Subscription Tier (Bronze, Silver, Gold, Platinum, Diamond, Emerald, Ruby, Opal)
  - Boost Badge & Status
  - Nitro Remaining Time
  - Account Badges (HypeSquad, Early Supporter, Active Developer, etc.)

- 🚀 **Boost Information**
  - Used Boosts
  - Available Boosts
  - Total Boosts

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
Phone: None [Not Verified]
Nitro Type: Nitro
Nitro Tier: Silver (3 Months)
Boost Badge: Server boosting since Apr 14, 2025
Badges: HypeSquad Bravery, Active Developer, Completed a Quest
Remaining Nitro Time: 30 Day 5 Hour 10 Minute
Boost: 1 used, 1 available, 2 total
Payments: VISA *1234 (05/27) - US [Valid]
Created At: Feb 4, 2023 (1y 3m ago)
```

## 🔄 Nitro Subscription Tiers

The tool recognizes all official Discord Nitro subscription tiers:

| Title | Earned by |
| ----- | --------- |
| Bronze (1 Month) | Subscribing to Nitro for 1 month |
| Silver (3 Months) | Subscribing to Nitro for 3 months |
| Gold (6 Months) | Subscribing to Nitro for 6 months |
| Platinum (12 Months) | Subscribing to Nitro for 12 months (1 year) |
| Diamond (24 Months) | Subscribing to Nitro for 24 months (2 years) |
| Emerald (36 Months) | Subscribing to Nitro for 36 months (3 years) |
| Ruby (60 Months) | Subscribing to Nitro for 60 months (5 years) |
| Opal (72+ Months) | Subscribing to Nitro for 72+ months (6+ years) |

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
- Discord: [@krexdll](https://discord.com/users/1012249571436548136)