# Discord Token Kontrol Aracı 🚀

## 🔍 Özellikler

- **Çoklu İş Parçacığı Desteği**: 1-100 arası thread ile hızlı kontrol
- **Kapsamlı Token Analizi**:
  - Hesap Detayları
  - Nitro Durumu ve Geçmişi
  - Boost Durumu ve Rozetleri
  - Ödeme Yöntemleri
  - Hesap Rozetleri
  - Oluşturulma Tarihi

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- NPM (Node Package Manager)
- İnternet Bağlantısı

## 🚀 Kurulum

1. Repoyu klonlayın veya indirin:
```bash
git clone https://github.com/Krex381/token-checker.git
cd token-checker
```

2. Gerekli paketleri yükleyin:
```bash
npm install
```

3. `tokens.txt` dosyasını oluşturun ve tokenlerinizi her satıra bir tane gelecek şekilde ekleyin.

## 💻 Kullanım

Programı başlatmak için:
```bash
node index.js
```

## ⚙️ Yapılandırma

`CONFIG` objesi üzerinden aşağıdaki ayarları özelleştirebilirsiniz:

```javascript
{
    retryLimit: 3,        // Başarısız denemeler için tekrar limiti
    requestDelay: 1500,   // İstekler arası bekleme süresi (ms)
    timeout: 5000,        // İstek zaman aşımı süresi (ms)
    saveValid: true       // Geçerli tokenleri kaydetme
}
```

## 📊 Çıktı Detayları

Her token için aşağıdaki bilgiler kontrol edilir:

- 👤 Kullanıcı Bilgileri
  - Kullanıcı Adı ve ID
  - E-posta ve Doğrulama Durumu
  
- 🎮 Discord Özellikleri
  - Nitro Üyeliği
  - Boost Durumu
  - Hesap Rozetleri
  
- 💳 Ödeme Bilgileri
  - Kayıtlı Ödeme Yöntemleri
  - Ödeme Durumları

## ⚠️ Güvenlik Uyarıları

- Token'larınızı güvenli bir şekilde saklayın
- Rate limit'lere dikkat edin
- Çok yüksek thread sayıları kullanmaktan kaçının

## 📝 Çıktı Örnekleri

```
[01/50] GEÇERLİ TOKEN
Kullanıcı: örnek#0000 (123456789)
E-posta: ornek@mail.com [Doğrulanmış]
Nitro: Nitro | Boost Rozeti: 1 Aylık Booster | Rozetler: Early Supporter
Boost: 1 | Ödemeler: Credit Card (Geçerli)
Oluşturulma: Jan 1, 2024 (30d 5h ago)
```

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b özellik/YeniÖzellik`)
3. Commit'leyin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'i push'layın (`git push origin özellik/YeniÖzellik`)
5. Pull Request oluşturun

## 📜 Lisans

Bu proje ISC lisansı altında lisanslanmıştır.

## ⭐ Geliştirici

**Krex**
- GitHub: [@Krex381](https://github.com/Krex381)
