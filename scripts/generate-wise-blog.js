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

<img src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1674&auto=format&fit=crop" alt="Cara bayar dengan aplikasi Wise antar negara" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" />

<h2>Mengapa Menggunakan Wise?</h2>
<ul>
<li><strong>Jauh Lebih Murah:</strong> Tidak ada biaya admin bank yang tersembunyi.</li>
<li><strong>Nilai Tukar Tengah:</strong> Menggunakan <em>mid-market rate</em> (kurs asli seperti di Google) tanpa <em>mark-up</em>.</li>
<li><strong>Sangat Cepat:</strong> Uang bisa sampai dalam hitungan detik ke rekening BCA/BNI Tenunan Sambas.</li>
</ul>

<h2>Langkah-Langkah Transfer ke BCA via Wise</h2>
<p>Ikuti panduan mudah berikut untuk menyelesaikan transaksi pesanan Anda di website kami:</p>

<h3>1. Buat Akun / Login Aplikasi Wise</h3>
<p>Silakan download aplikasi Wise di <strong>App Store</strong> (iOS) atau <strong>Google Play Store</strong> (Android). Jika Anda belum memiliki akun, daftarlah secara gratis dengan email atau akun Google/Facebook Anda.</p>

<h3>2. Atur Nominal Pengiriman</h3>
<img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1740&auto=format&fit=crop" alt="Mengatur nominal konversi uang BND ke Rupiah di Wise" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" />
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
<img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1674&auto=format&fit=crop" alt="Konfirmasi bukti transfer pesanan songket" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" />
<p>Setelah uang berhasil terkirim melalui Wise (Anda akan melihat tanda centang hijau), <em>screenshot</em> (tangkap layar) bukti sukses tersebut. Selanjutnya:</p>
<ul>
<li>Kembali ke <em>website</em> <strong>Tenunan Sambas</strong>.</li>
<li>Pilih menu <strong>Konfirmasi Pembayaran</strong> atau balas pesan otomatis kami dari <strong>WhatsApp</strong>.</li>
<li>Unggah/lampirkan bukti <em>screenshot</em> Wise tersebut.</li>
</ul>
<p>Admin kami akan segera memproses pesanan kain songket berkualitas tinggi Anda untuk dikemas dengan aman dan dikirim langsung menuju alamat Anda di Brunei Darussalam atau Malaysia. Proses pengiriman internasional yang didukung kurir tepercaya memastikan barang Anda tiba tepat waktu.</p>
<p>Jika ada kendala selama bertransaksi, jangan ragu menekan tombol WhatsApp yang ada di situs ini. Tim <em>Customer Service</em> kami selalu bersedia memandu Anda! Selamat berbelanja.</p>
  `;

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: 'Panduan Praktis Transfer Pembayaran dari Brunei ke BCA/BNI Menggunakan Wise',
      slug: 'cara-transfer-dari-brunei-malaysia-ke-indonesia-pakai-wise',
      excerpt: 'Tutorial lengkap cara membayar pesanan Tenunan Sambas menggunakan mata uang BND/MYR ke rekening BCA atau BNI tanpa biaya admin internasional yang mahal.',
      content: content,
      featured_image_url: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?q=80&w=1740&auto=format&fit=crop',
      category_id: 'cb10d11a-27be-4474-b7cb-0a8a4c949950', // Kategori Panduan Belanja
      author_id: '68d3710e-674a-47c7-8e9f-b6042eb92c31',
      status: 'published',
      published_at: new Date().toISOString(),
      meta_title: 'Cara Transfer Pembayaran dari Brunei & Malaysia ke Indonesia (Wise)',
      meta_description: 'Panduan lengkap dan praktis cara belanja dan bayar pesanan kain songket dari Brunei Darussalam atau Malaysia ke rekening BCA/BNI Indonesia menggunakan aplikasi Wise. Murah, cepat, dan aman.',
      canonical_url: 'https://tenunansongket.com/blog/cara-transfer-dari-brunei-malaysia-ke-indonesia-pakai-wise',
      reading_time_minutes: 4,
      is_featured: true
    })
    .select();

  if (error) {
    console.error('Error inserting blog post:', error);
  } else {
    console.log('Blog post created successfully!');
    console.log(data);
  }
}

main();