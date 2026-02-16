export const CHECKLIST_TEMPLATES = {
    'klima': {
        label: 'Klima Montajı',
        steps: [
            {
                title: 'Dış ünite yer tespiti ve montajı',
                description: 'Duvar veya zemin konsolu ile sabitleme',
                subSteps: [
                    { title: 'Montaj yerinin belirlenmesi' },
                    { title: 'Konsol sabitlenmesi' },
                    { title: 'Ünitenin konsolda dengelenmesi' }
                ]
            },
            {
                title: 'İç ünite yer tespiti ve montajı',
                description: 'Terazi kontrolü ve montaj plakası sabitleme',
                subSteps: [
                    { title: 'Montaj plakası seviye kontrolü' },
                    { title: 'Plakanın duvara sabitlenmesi' },
                    { title: 'İç ünitenin plakaya takılması' }
                ]
            },
            {
                title: 'Bakır boru hattı çekilmesi',
                description: 'İzolasyon ve boru bükümü',
                subSteps: [
                    { title: 'Boru uzunluğunun ölçülmesi' },
                    { title: 'Boruların bükülmesi' },
                    { title: 'İzolasyon montajı' }
                ]
            },
            {
                title: 'Drenaj hattı çekilmesi',
                description: 'Eğim kontrolü ve su testi',
                subSteps: [
                    { title: 'Drenaj borusunun eğim kontrolü' },
                    { title: 'Su testi yapılması' }
                ]
            },
            {
                title: 'Elektrik bağlantılarının yapılması',
                description: 'İç ve dış ünite arası sinyal kablosu',
                subSteps: [
                    { title: 'Kablo çekilmesi' },
                    { title: 'Bağlantıların yapılması' },
                    { title: 'İzolasyon kontrolü' }
                ]
            },
            {
                title: 'Vakumlama işlemi',
                description: 'Sistemdeki nem ve havanın alınması',
                subSteps: [
                    { title: 'Vakum pompası bağlantısı' },
                    { title: '15-20 dk vakum çekilmesi' },
                    { title: 'Basınç kontrolü' }
                ]
            },
            {
                title: 'Gaz açımı ve kaçak kontrolü',
                description: 'Köpük veya dedektör ile kontrol',
                subSteps: [
                    { title: 'Gaz vanalarının açılması' },
                    { title: 'Bağlantılarda kaçak kontrolü' }
                ]
            },
            {
                title: 'Performans testi',
                description: 'Isıtma ve soğutma modlarında test',
                subSteps: [
                    { title: 'Soğutma modu testi' },
                    { title: 'Isıtma modu testi' },
                    { title: 'Basınç değerlerinin kontrolü' }
                ]
            },
            {
                title: 'Müşteri bilgilendirme ve teslim',
                description: 'Kumanda kullanımı ve garanti bilgisi',
                subSteps: [
                    { title: 'Kumanda kullanım eğitimi' },
                    { title: 'Garanti belgelerinin teslimi' },
                    { title: 'Bakım tavsiyelerinin verilmesi' }
                ]
            }
        ]
    },
    'silo': {
        label: 'Silo Montajı',
        steps: [
            {
                title: 'Zemin beton kontrolü',
                description: 'Terazi, mukavemet ve ankraj yerleşimi kontrolü',
                subSteps: [
                    { title: 'Zemin düzlük kontrolü' },
                    { title: 'Beton mukavemet testi' },
                    { title: 'Ankraj noktalarının işaretlenmesi' }
                ]
            },
            {
                title: 'Silo gövde panellerinin montajı',
                description: 'İlk ring montajı ve yükseltme',
                subSteps: [
                    { title: 'İlk ring panellerinin yerleştirilmesi' },
                    { title: 'Dikey seviye kontrolü' },
                    { title: 'Üst ringlerin sırayla montajı' }
                ]
            },
            {
                title: 'Cıvata tork kontrolleri',
                description: 'Tüm birleşim noktalarının torklanması',
                subSteps: [
                    { title: 'Tork değerlerinin belirlenmesi' },
                    { title: 'Cıvataların sıkılması' },
                    { title: 'Kontrol sıkımı' }
                ]
            },
            {
                title: 'Sızdırmazlık kontrolü',
                description: 'Panel birleşim yerlerine mastik uygulaması',
                subSteps: [
                    { title: 'Birleşim yerlerinin temizlenmesi' },
                    { title: 'Mastik uygulaması' }
                ]
            },
            {
                title: 'Çatı panellerinin montajı',
                description: 'Çatı konstrüksiyonu ve kaplama',
                subSteps: [
                    { title: 'Çatı demirlerin montajı' },
                    { title: 'Çatı panellerinin yerleştirilmesi' },
                    { title: 'Su yalıtımı kontrolü' }
                ]
            },
            {
                title: 'Havalandırma bacalarının montajı',
                description: 'Fan ve baca montajı',
                subSteps: [
                    { title: 'Baca deliklerinin açılması' },
                    { title: 'Fan montajı' },
                    { title: 'Elektrik bağlantıları' }
                ]
            },
            {
                title: 'Merdiven ve platform montajı',
                description: 'Güvenlik kafesi ve korkuluklar',
                subSteps: [
                    { title: 'Merdiven montajı' },
                    { title: 'Platform döşenmesi' },
                    { title: 'Güvenlik korkuluklarının takılması' }
                ]
            },
            {
                title: 'Alt konik montajı',
                description: 'Varsa alt konik ve boşaltma ağzı',
                subSteps: [
                    { title: 'Konik panellerinin montajı' },
                    { title: 'Boşaltma kapağı takılması' }
                ]
            },
            {
                title: 'Yükleme/Boşaltma sistemi testi',
                description: 'Helezon ve elevatör kontrolleri',
                subSteps: [
                    { title: 'Helezon dönüş testi' },
                    { title: 'Elevatör çalışma testi' },
                    { title: 'Emniyet sistemleri kontrolü' }
                ]
            }
        ]
    }
};
