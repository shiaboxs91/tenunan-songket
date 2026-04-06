const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const content = `
<p>Bagi pelanggan setia kami dari <strong>Brunei Darussalam</strong>, <strong>Malaysia</strong>, dan <strong>Singapura</strong> yang ingin berbelanja kain songket asli di <em>Tenunan Sambas</em>, sering kali bingung bagaimana cara melakukan pembayaran antar negara dengan cepat, aman, dan tanpa biaya transfer bank internasional (<em>Telegraphic Transfer</em>) yang mahal.</p>
<p>Kabar baiknya, kini Anda dapat membayar pesanan Anda langsung ke rekening BCA atau BNI kami menggunakan <strong>Aplikasi Wise (sebelumnya TransferWise)</strong>. Dengan Wise, nilai tukar BND/MYR ke IDR jauh lebih transparan dan potongan biayanya sangat minim.</p>

<div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center; border: 1px solid #e2e8f0;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 64px; height: 64px; margin: 0 auto 12px auto;"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
  <h3 style="margin-top: 0; color: #1e293b;">Kelebihan Menggunakan Wise</h3>
  <ul style="text-align: left; max-width: 400px; margin: 0 auto; color: #475569;">
    <li><strong>Jauh Lebih Murah:</strong> Tidak ada biaya admin bank yang tersembunyi.</li>
    <li><strong>Nilai Tukar Tengah:</strong> Menggunakan <em>mid-market rate</em> (kurs asli seperti di Google) tanpa <em>mark-up</em>.</li>
    <li><strong>Sangat Cepat:</strong> Uang bisa sampai dalam hitungan detik ke rekening BCA/BNI Tenunan Sambas.</li>
  </ul>
</div>

<h2>Langkah-Langkah Transfer ke BCA via Wise</h2>
<p>Ikuti panduan mudah berikut untuk menyelesaikan transaksi pesanan Anda di website kami:</p>

<h3>1. Buat Akun / Login Aplikasi Wise</h3>
<p>Silakan download aplikasi Wise di <strong>App Store</strong> (iOS) atau <strong>Google Play Store</strong> (Android). Jika Anda belum memiliki akun, daftarlah secara gratis dengan email atau akun Google/Facebook Anda.</p>

<h3>2. Atur Nominal Pengiriman</h3>
<div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center; border: 1px solid #e2e8f0;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 64px; height: 64px; margin: 0 auto 12px auto;"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
  <p style="color: #475569; margin: 0; font-weight: 600;">Pengaturan Konversi BND/MYR &rarr; IDR</p>
</div>
<p>Klik tombol <strong>"Send"</strong> (Kirim uang).</p>
<ul>
<li>Pada kolom <strong>"You send"</strong> (Mata uang Anda): Pilih BND (Brunei Dollar) atau MYR (Ringgit).</li>
<li>Pada kolom <strong>"Recipient gets"</strong> (Penerima menerima): Pastikan Anda memilih <strong>IDR (Indonesian Rupiah)</strong>.</li>
<li>Masukkan <strong>Total Pesanan Rupiah</strong> (termasuk ongkir) yang muncul pada <em>invoice</em> atau halaman <em>Checkout</em> pesanan Tenunan Sambas Anda. Nilai BND yang harus Anda bayar akan terhitung secara otomatis.</li>
</ul>

<h3>3. Masukkan Rekening Tenunan Sambas (BCA / BNI)</h3>
<p>Klik tombol "Continue". Kemudian tambahkan penerima baru (<strong>New Recipient</strong>) dan pilih opsi <strong>"Business/Charity"</strong> atau <strong>"Someone else"</strong>.</p>
<p>Isi rincian bank kami berikut (Pilih salah satu yang paling mudah bagi Anda):</p>
<div style="background: #FFFBEB; padding: 20px; border-left: 4px solid #D97706; border-radius: 4px; margin-bottom: 20px;">
  <strong>Bank Central Asia (BCA)</strong><br />
  Nomor Rekening: <strong>6665155297</strong><br />
  Atas Nama: <strong>Andi</strong><br />
</div>
<p><em>(Jika diminta Bank Code atau Swift Code, biarkan kosong jika Anda bisa menemukan nama bank dalam daftar _dropdown_ aplikasi Wise).</em></p>

<h3>4. Tinjau dan Konfirmasi Pembayaran Anda</h3>
<p>Sebelum mengklik konfirmasi, periksa kembali nilai IDR yang diterima oleh kami apakah sudah sesuai dengan total <em>invoice</em>. Pada bagian catatan transfer (<em>Reference/Note</em>), mohon sertakan <strong>Nomor Pesanan (Order ID)</strong> Anda agar memudahkan admin kami melakukan validasi pesanan (contoh: <em>Order ORD-827364</em>).</p>

<h3>5. Selesaikan Pembayaran di Wise Anda</h3>
<p>Wise akan meminta Anda melakukan deposit dana (baik via kartu debit, kartu kredit Brunei/Malaysia, maupun transfer online bank lokal Anda ke rekening lokal Wise di negara Anda). Proses ini sangat intuitif dan otomatis.</p>

<h3>6. Kirimkan Bukti Transfer (Penting!)</h3>
<div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center; border: 1px solid #bbf7d0;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 64px; height: 64px; margin: 0 auto 12px auto;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  <h3 style="margin-top: 0; color: #15803d;">Transfer Sukses! Konfirmasi Bukti ke Tenunan Sambas</h3>
</div>
<p>Setelah uang berhasil terkirim melalui Wise (Anda akan melihat tanda centang hijau), <em>screenshot</em> (tangkap layar) bukti sukses tersebut. Selanjutnya:</p>
<ul>
<li>Kembali ke <em>website</em> <strong>Tenunan Sambas</strong>.</li>
<li>Pilih menu <strong>Konfirmasi Pembayaran</strong> atau balas pesan otomatis kami dari <strong>WhatsApp</strong>.</li>
<li>Unggah/lampirkan bukti <em>screenshot</em> Wise tersebut.</li>
</ul>
<p>Admin kami akan segera memproses pesanan kain songket berkualitas tinggi Anda untuk dikemas dengan aman dan dikirim langsung menuju alamat Anda di Brunei Darussalam atau Malaysia. Proses pengiriman internasional yang didukung kurir tepercaya memastikan barang Anda tiba tepat waktu.</p>
<p>Jika ada kendala selama bertransaksi, jangan ragu menekan tombol WhatsApp yang ada di situs ini. Tim <em>Customer Service</em> kami selalu bersedia memandu Anda! Selamat berbelanja.</p>
  `;

  await supabase
    .from('blog_posts')
    .update({ content })
    .eq('slug', 'cara-transfer-dari-brunei-malaysia-ke-indonesia-pakai-wise');

  console.log('Blog content successfully updated without random images.');
}

main();