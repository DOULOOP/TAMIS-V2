# Repo Yönergeleri

## Proje Yapısı ve Modül Organizasyonu
- Python backend repo kökünde yaşar: `api_server.py`, `start_api_server.py`, `disaster_labeling.py`, `create_web_map.py`.
- Veriler `1c__Hatay_Enkaz_Bina_Etiketleme/` altında kalır (TIFF/shape dosyaları). Yolları stabil tut.
- Statik çıktılar (resimler, HTML haritalar) `static/`'e yazılır ve API tarafından sunulur.
- Frontend `client/` içinde Next.js'tir ve `src/app`, `src/components`, `src/lib` vardır.
- Dokümanlar: `README.md`, `API_DOCUMENTATION.md`, `INTEGRATION_GUIDE.md`.

## Derleme, Test ve Geliştirme Komutları
- Python kurulumu (Windows): `python -m venv .venv && .\.venv\Scripts\activate && pip install -r requirements.txt`.
- API çalıştır (dev): `python start_api_server.py` veya `python api_server.py` → dokümanlar `http://127.0.0.1:7887/docs`.
- Sağlık kontrolü: `curl http://127.0.0.1:7887/health`.
- Frontend dev: `cd client && npm install && npm run dev` → `http://localhost:3000`.
- Frontend build/start: `cd client && npm run build && npm start`.
- Lint (client): `cd client && npm run lint`.

## Kodlama Stili ve İsimlendirme Kuralları
- Python: PEP 8, 4-space indent, praktik olduğu yerlerde tip ipuçları ekle; fonksiyon/modüller `snake_case` kullanır.
- Frontend: React bileşenleri `src/components` içinde `PascalCase.tsx`; yardımcı programlar `src/lib` içinde `camelCase.ts`.
- API: rota ve model isimleri `API_DOCUMENTATION.md` ile eşleşmeli; değişiklikleri bozmaktan kaçın.
- Linting: ESLint `client/eslint.config.mjs` içinde yapılandırılmıştır.

## Test Yönergeleri
- Dahil edilen resmi suite yok. Manuel kontrollerle küçük, doğrulanabilir değişiklikleri tercih et:
  - Backend: `GET /health`, `/data/info`, ve örnek analiz uç noktaları.
  - Frontend: `src/app/page.tsx` ve ilgili bileşenlerdeki akışları doğrula.
- Test ekliyorsan: Python için `pytest` (`tests/` veya `test_*.py`), ve client için Vitest/Jest (`*.test.ts`) kullan. Testleri hızlı ve izole tut.

## Commit ve Pull Request Yönergeleri
- Commit'ler: özlü, emir kipi başlık (≤ 72 karakter). Örnek: `feat(api): alan arama uç noktası ekle`.
- PR'lar: amaç, kapsam, UI için ekran görüntüleri ve ilgili doküman/sorunlara bağlantılar dahil et. Herhangi bir veri/şema etkisini ve API değişikliklerini not et.
- Değişiklikleri kapsamlı tut (backend vs client) ve etkilenen yolları referans al.

## Güvenlik ve Yapılandırma İpuçları
- Sırları commit etme; frontend konfigürasyonu için `client/.env.local` kullan. Backend yerel dosyaları okur; gizli anahtar beklenmez.
- Büyük varlıklar (TIFF/PNG/ZIP): Git LFS'yi düşün; `1c__Hatay_Enkaz_Bina_Etiketleme/` içindeki dosyaları betikleri güncellemeden yeniden adlandırmaktan kaçın.
- CORS: API `http://localhost:3000`'e izin verir; başka yerde dağıtıyorsan ayarla.

