# TMDDI Language Coach — ücretsiz yerel AI prototipi

Bu proje bir web uygulaması/PWA ve Node.js sunucusudur. Sohbet yanıtları için varsayılan olarak **Ollama** ile bilgisayarında çalışan yerel bir dil modeli kullanır. Böylece bu kurulumda bir API anahtarı veya model başına servis ücreti gerekmez. Bilgisayarının belleği/işlem gücü gerekir; yerel modeller bulut modellerinden daha yavaş veya daha az yetenekli olabilir.

> Bu paket hazır bir Android APK değildir. Uygulama önce web uygulaması olarak çalışır; Android'de Chrome üzerinden PWA olarak kurulabilir. PWA kurulumu için çoğu durumda HTTPS üzerinden yayınlamak gerekir. APK üretmek için ayrıca Android Studio/Capacitor gibi bir paketleme adımı gerekir.

## En kolay kurulum (Windows / macOS / Linux)

1. Node.js 18 veya üzerini kur: https://nodejs.org/
2. Ollama'yı kur: https://ollama.com/
3. Terminal/Komut İstemi'nde bir model indir:
   ```bash
   ollama pull qwen2.5:3b
   ```
   Daha güçlü bilgisayarlarda `qwen2.5:7b` deneyebilirsin. Modelin indirme boyutu ve sistem gereksinimleri değişebilir.
4. Ollama'nın çalıştığından emin ol. Genellikle `http://localhost:11434` adresinde çalışır.
5. Bu klasörde terminal açıp sunucuyu başlat:
   ```bash
   node server.js
   ```
6. Tarayıcıda `http://localhost:3000` aç.

Node.js dışında bu projeye npm paketi kurmak gerekmez. İlk model indirmesi internet ve disk alanı gerektirir; sonrasında yerel sohbetler model bilgisayarındaysa çevrimdışı çalışabilir.

## Android telefonda kullanma

- En kolay deneme: Bilgisayar ve telefon aynı Wi-Fi ağına bağlı olsun. Bilgisayarın yerel IP adresini öğren ve sunucuyu `node server.js` ile çalıştır.
- Telefon tarayıcısından `http://BILGISAYAR_IP:3000` adresine git. Güvenlik duvarı 3000 portuna erişime izin vermelidir.
- Tarayıcıdaki mikrofon izinleri ve bazı PWA kurulum özellikleri HTTP yerel ağında sınırlı olabilir.
- Uygulamayı ana ekrana ekleme ve PWA kurulumu tarayıcı/işletim sistemi desteğine bağlıdır. İnternet üzerinden kurulum için HTTPS yayın önerilir.
- Gerçek APK isteniyorsa bu web projesi Capacitor/Android Studio ile Android kabuğuna paketlenmelidir; bu ZIP tek başına APK içermez.

## Desteklenen diller

Arayüzde şu 16 pratik dili bulunur: Türkmence, Türkçe, Arapça, Farsça, Korece, Çince, Japonca, İngilizce, Fransızca, Rusça, Urdu dili, Almanca, İspanyolca, İtalyanca, Yunanca ve Hintçe. Ses tanıma ve sesli okuma desteği kullanılan tarayıcı ve cihazın ilgili dil/voice desteğine bağlıdır.

## Dil / model ayarı

Varsayılan model `qwen2.5:3b`'dir. Başka bir Ollama modelini kullanmak için:
- macOS/Linux: `OLLAMA_MODEL=llama3.2:3b node server.js`
- PowerShell: `$env:OLLAMA_MODEL="llama3.2:3b"; node server.js`

## Gizlilik ve ücret

- Bu örnek, sohbet metnini yerel Ollama sunucusuna gönderir. Varsayılan kurulumda harici AI API'sine göndermez.
- Bu paket reklam, üyelik veya uygulama içi satın alma kodu içermez.
- Ücretsiz olması için yerel model seçildi; donanım, elektrik ve internet/model indirme maliyetleri kullanıcıya ait olabilir.
- Telefon mikrofonu için tarayıcı izni gerekir. Ses tanıma, tarayıcının kendi konuşma tanıma hizmetine bağlı olabilir; her tarayıcıda çevrimdışı çalışacağı garanti edilmez.
- Bu geliştirme prototipini internete herkese açık sunucu olarak dağıtmadan önce kimlik doğrulama, istek sınırlama, HTTPS ve güvenlik ayarları ekleyin.

## Dosyalar

- `public/index.html`: kullanıcı arayüzü, ses tanıma ve sesli okuma
- `server.js`: yerel Ollama ile AI sohbet API'si
- `public/manifest.webmanifest`: PWA manifesti
- `public/sw.js`: temel çevrimdışı arayüz önbelleği
