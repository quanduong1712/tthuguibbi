# Huong dan chinh sua trang Trung Thu 3D

Trang nay chay truc tiep bang `index.html`. Khong can cai Node.js hay npm.

## Bat dau nhanh

1. Mo thu muc `tthu3d` bang VS Code.
2. Sua cac noi dung theo cac muc ben duoi.
3. Mo `index.html` bang trinh duyet, hoac dung extension Live Server de xem ngay sau moi lan luu.

## Noi can sua nhieu nhat

### 1. Loi chuc va anh tung long den

Mo `assets/script.js`, tim `const wishList = [`.

Moi khoi co dang:

```js
{
  text: "Loi chuc hien tren the khi bam long den.",
  img: "./assets/1.jpg",
},
```

- Sua `text` de viet loi nhan rieng.
- Sua `img` thanh anh muon hien. Anh phai nam trong thu muc `assets`.
- Co the tao them loi chuc bang cach copy ca khoi tren, dan xuong duoi, roi sua noi dung.
- Long den chon ngau nhien mot khoi trong danh sach nay, vi vay mot loi chuc co the xuat hien nhieu lan.

Vi du dung anh moi ten `anh-chung-minh.jpg`:

```js
{
  text: "Cam on em da den trong cuoc doi anh. Trung Thu nay va nhieu Trung Thu nua, minh cung nhau don nhe.",
  img: "./assets/anh-chung-minh.jpg",
},
```

Hay chep anh vao `assets` truoc, sau do dung dung ten tep, bao gom ca duoi `.jpg`, `.png`, hoac `.webp`.

### 2. Tieu de, dong goi y va nhan tren the

Mo `index.html` va sua truc tiep cac dong sau:

| Noi dung tren man hinh | Vi tri can sua |
| --- | --- |
| Ten tren tab trinh duyet | `<title>Trung Thu 3D</title>` |
| Dong goi y phia duoi | `<div class="click-hint">...</div>` |
| Tieu de cua the loi chuc | `<h3 id="wishTitle">...</h3>` |
| Nhan nho cuoi the | `<div class="tag">...</div>` |

Doan `<p id="wishText">...</p>` chi la noi dung mac dinh trong luc tai trang. Khi bam long den, no se duoc thay bang `text` trong `wishList`.

### 3. Nhac nen

Tep nhac hien tai la `assets/1.mp3`. Neu thay nhac, chep tep moi vao `assets`, vi du `nhac-cua-minh.mp3`, roi sua trong `index.html`:

```html
<audio id="bgm" loop src="./assets/nhac-cua-minh.mp3"></audio>
```

Nguoi xem can bam nut hinh not nhac o goc tren phai de bat nhac. Day la quy tac tu dong phat cua trinh duyet.

## Doi mau va khong khi

Mo `assets/css.css` de doi giao dien cua hop loi chuc:

| Muon doi | Tim trong `css.css` |
| --- | --- |
| Nen trang | `background-color: #030208` |
| Mau nut va tieu de vang | `color: #ffd700` |
| Nen hop loi chuc | `.wish-card` va `background: linear-gradient(...)` |
| Mau chu loi chuc | `.wish-card p` va `color: #f0e6ff` |
| Kich thuoc anh trong the | `.wish-image-container` va `height: 180px` |

Trong `assets/script.js`, cac mau cua canh 3D nam gan dau tep:

| Thanh phan | Bien/cum tu can tim |
| --- | --- |
| Mau suong, bau troi | `scene.fog` |
| Mau hoa tren cay | `colorDustyPink`, `colorSoftPink`, `colorPaleRose`, `colorSoftWhite` |
| Mau long den | `createLanternTexture()` |
| Mau phao hoa | `color: 0xffd700` trong `createFirework` |

Mau trong Three.js dung dang hex co `0x`, vi du `0xff6699`. Mau trong CSS dung `#`, vi du `#ff6699`.

## Dieu chinh chuyen dong va hieu nang

Trong `assets/script.js`:

| Muon doi | Tim va sua |
| --- | --- |
| So long den | `const lanternCount = isMobile ? 24 : 38;` |
| Toc do long den bay | `speedY: 0.008 + Math.random() * 0.012` |
| So tho | Vong lap `for (let i = 0; i < 4; i++)` |
| So canh hoa roi | `const fallingPetalsCount = isMobile ? 80 : 180;` |
| So sao | `const starCount = isMobile ? 400 : 900;` |
| Mat do hoa tren cay | `const particleCount = isMobile ? 22000 : 38000;` |

Neu dien thoai chay cham, giam `particleCount` truoc. Day la thanh phan nang nhat.

## Khong nen sua

- `assets/three.min.js`: thu vien tao 3D.
- `assets/OrbitControls.js`: thu vien keo, xoay va zoom camera.

Chi sua `index.html`, `assets/css.css`, va `assets/script.js` la du cho viec ca nhan hoa trang.

## Kiem tra khi anh khong hien

1. Anh phai nam trong `assets`.
2. Ten trong `img` phai trung tung ky tu voi ten tep, ke ca `.jpg` va `.JPG`.
3. Duong dan phai bat dau bang `./assets/`, vi du `./assets/anh-chung-minh.jpg`.
4. Tai lai trang bang `Ctrl + F5` de xoa cache.