"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, GripVertical, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { upsertHeroSlide, deleteHeroSlide, getHeroSlidesClient } from "@/lib/supabase/hero-client";
import { HeroSlide } from "@/lib/supabase/hero";
import { createClient } from "@/lib/supabase/client";

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    try {
      setLoading(true);
      const data = await getHeroSlidesClient();
      setSlides(data);
    } catch (error) {
      console.error("Error fetching slides:", error);
      toast.error("Gagal memuat slide");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(slide: Partial<HeroSlide>) {
    try {
      // Validate
      if (!slide.title || !slide.image_url) {
        toast.error("Judul dan Gambar wajib diisi");
        return;
      }

      await upsertHeroSlide(slide);
      toast.success("Slide berhasil disimpan");
      setEditingSlide(null);
      fetchSlides();
    } catch (error) {
      console.error("Error saving slide:", error);
      toast.error("Gagal menyimpan slide");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus slide ini?")) return;

    try {
      await deleteHeroSlide(id);
      toast.success("Slide berhasil dihapus");
      fetchSlides();
    } catch (error) {
      console.error("Error deleting slide:", error);
      toast.error("Gagal menghapus slide");
    }
  }

  function handleAddNew() {
    setEditingSlide({
      order_index: slides.length + 1,
      is_active: true,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hero Slider</h1>
          <p className="text-muted-foreground">
            Kelola slide yang tampil di halaman utama.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Slide
        </Button>
      </div>

      {editingSlide && (
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader>
            <CardTitle>{editingSlide.id ? "Edit Slide" : "Slide Baru"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Judul Utama</Label>
                <Input
                  value={editingSlide.title || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  placeholder="Contoh: Keindahan Tenunan Songket"
                />
              </div>
              <div className="space-y-2">
                <Label>Sub-judul (Kecil di atas)</Label>
                <Input
                  value={editingSlide.subtitle || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  placeholder="Contoh: Warisan Budaya Melayu"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>URL Gambar</Label>
                <div className="flex gap-2">
                  <Input
                    value={editingSlide.image_url || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                  {/* Future: Add Image Upload here */}
                </div>
                {editingSlide.image_url && (
                  <div className="mt-2 relative h-40 w-full rounded-md overflow-hidden bg-slate-100">
                    <img src={editingSlide.image_url} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Teks Tombol (Opsional)</Label>
                <Input
                  value={editingSlide.cta_text || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, cta_text: e.target.value })}
                  placeholder="Contoh: Belanja Sekarang"
                />
              </div>
              <div className="space-y-2">
                <Label>Link Tombol / Slide</Label>
                <Input
                  value={editingSlide.cta_link || editingSlide.link_url || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, cta_link: e.target.value, link_url: e.target.value })}
                  placeholder="/products"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Deskripsi (Opsional)</Label>
                <Textarea
                  value={editingSlide.description || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                  placeholder="Deskripsi singkat..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingSlide.is_active}
                  onCheckedChange={(checked) => setEditingSlide({ ...editingSlide, is_active: checked })}
                />
                <Label>Aktif</Label>
              </div>
              <div className="flex items-center space-x-2">
                 <Label>Urutan</Label>
                 <Input 
                    type="number" 
                    className="w-20"
                    value={editingSlide.order_index}
                    onChange={(e) => setEditingSlide({ ...editingSlide, order_index: parseInt(e.target.value) || 0 })}
                 />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditingSlide(null)}>Batal</Button>
              <Button onClick={() => handleSave(editingSlide)}>
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {slides.map((slide) => (
          <Card key={slide.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-32 md:h-auto relative bg-slate-100">
                 {slide.image_url ? (
                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                 ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <ImageIcon className="h-8 w-8" />
                    </div>
                 )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center">
                 <div className="flex justify-between items-start">
                    <div>
                        {slide.subtitle && (
                            <div className="text-xs font-medium text-amber-600 mb-1">{slide.subtitle}</div>
                        )}
                        <h3 className="text-lg font-bold">{slide.title}</h3>
                        {slide.description && <p className="text-sm text-muted-foreground line-clamp-2">{slide.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingSlide(slide)}>
                            <Save className="h-4 w-4" /> {/* Actually 'Edit' icon would be better but keeping simple */}
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(slide.id)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>
                 <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {slide.is_active ? 'Aktif' : 'Non-aktif'}
                    </span>
                    <span className="text-slate-500">Urutan: {slide.order_index}</span>
                    {slide.cta_link && <span className="text-blue-600 truncate max-w-[200px]">{slide.cta_link}</span>}
                 </div>
              </div>
            </div>
          </Card>
        ))}
        {!loading && slides.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                Tidak ada slide. Klik "Tambah Slide" untuk membuat baru.
            </div>
        )}
      </div>
    </div>
  );
}
