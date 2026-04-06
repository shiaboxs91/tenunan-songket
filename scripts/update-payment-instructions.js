const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateInstructions() {
  const newInstructions = `Silakan transfer ke salah satu rekening BCA/BNI di atas.
  
Bagi pelanggan dari Brunei, Malaysia, atau Singapura, Anda bisa menggunakan aplikasi Wise agar transfer langsung masuk sebagai IDR tanpa potongan bank yang mahal. <a href='/blog/cara-transfer-dari-brunei-malaysia-ke-indonesia-pakai-wise' style='color:#D97706; text-decoration:underline; font-weight:500;'>Lihat panduan belanja dengan Wise di sini.</a>

Setelah mentransfer, harap konfirmasi dengan mengirimkan bukti screenshot transfer melalui WhatsApp. Pesanan Anda akan kami kemas setelah pembayaran terverifikasi.`;

  const { data, error } = await supabase
    .from('payment_methods')
    .update({ instructions: newInstructions })
    .eq('type', 'bank_transfer')
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Instructions updated:', data);
  }
}

updateInstructions();