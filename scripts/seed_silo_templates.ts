
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Silo Templates...');

    // --- 1 Katlı Silo Montajı ---
    const silo1 = await prisma.jobTemplate.upsert({
        where: { name: '1 Katlı Silo Montajı' },
        update: {}, // Eğer varsa güncelleme (şimdilik boş)
        create: {
            name: '1 Katlı Silo Montajı',
            description: 'Tek katlı standart silo montajı için iş akışı.',
            steps: {
                create: [
                    {
                        title: 'Zemin ve Temel Kontrolü',
                        order: 1,
                        subSteps: {
                            create: [
                                { title: 'Temel terazisinin (kot farkı) kontrol edilmesi', order: 1 },
                                { title: 'Montaj alanının temizlenmesi ve güvenliğin sağlanması', order: 2 },
                                { title: 'Aksların işaretlenmesi ve merkezlemenin yapılması', order: 3 }
                            ]
                        }
                    },
                    {
                        title: 'Gövde Montajı (1. Ring)',
                        order: 2,
                        subSteps: {
                            create: [
                                { title: '1. Ring panellerinin sahaya dizilmesi', order: 1 },
                                { title: 'Yatay ve dikey birleşim yerlerine sızdırmazlık şeritlerinin çekilmesi', order: 2 },
                                { title: 'Panellerin birleştirilmesi ve geçici sabitleme', order: 3 },
                                { title: 'Tüm civata ve somunların tork değerine uygun sıkılması', order: 4 }
                            ]
                        }
                    },
                    {
                        title: 'Çatı Montajı',
                        order: 3,
                        subSteps: {
                            create: [
                                { title: 'Çatı konstrüksiyonunun (kirişlerin) montajı', order: 1 },
                                { title: 'Çatı panellerinin yerleştirilmesi ve vidalanması', order: 2 },
                                { title: 'Tepe kapağı ve havalandırma bacalarının montajı', order: 3 },
                                { title: 'Çatı merdiveni ve korkulukların montajı', order: 4 }
                            ]
                        }
                    },
                    {
                        title: 'Tamamlama ve Teslim',
                        order: 4,
                        subSteps: {
                            create: [
                                { title: 'Silo ankrajlarının (temel bağlantılarının) yapılması', order: 1 },
                                { title: 'Genel civata ve sızdırmazlık kontrolü', order: 2 },
                                { title: 'Çevre temizliği ve atıkların toplanması', order: 3 }
                            ]
                        }
                    }
                ]
            }
        }
    });
    console.log('Created/Updated: 1 Katlı Silo Montajı');


    // --- 2 Katlı Silo Montajı ---
    const silo2 = await prisma.jobTemplate.upsert({
        where: { name: '2 Katlı Silo Montajı' },
        update: {},
        create: {
            name: '2 Katlı Silo Montajı',
            description: 'İki katlı yüksek silo montajı için detaylı iş akışı.',
            steps: {
                create: [
                    {
                        title: 'Zemin ve Temel Kontrolü',
                        order: 1,
                        subSteps: {
                            create: [
                                { title: 'Temel terazisinin (kot farkı) kontrol edilmesi', order: 1 },
                                { title: 'Montaj alanının temizlenmesi', order: 2 },
                                { title: 'Merkez ve aks işaretlemeleri', order: 3 }
                            ]
                        }
                    },
                    {
                        title: 'Çatı ve En Üst Ring Montajı',
                        order: 2,
                        subSteps: {
                            create: [
                                { title: 'En üst ring (2. Ring) panellerinin montajı', order: 1 },
                                { title: 'Çatı konstrüksiyonu ve panellerinin montajı', order: 2 },
                                { title: 'Tepe kapağının takılması', order: 3 },
                                { title: 'Kaldırma sistemi (krikoların) kurulumu', order: 4 }
                            ]
                        }
                    },
                    {
                        title: 'Gövde Yükseltme ve Alt Ring (1. Ring) Montajı',
                        order: 3,
                        subSteps: {
                            create: [
                                { title: 'Montajı biten üst kısmın krikolarla kaldırılması', order: 1 },
                                { title: 'Alt ring (1. Ring) panellerinin yerleştirilmesi', order: 2 },
                                { title: 'Kat arası sızdırmazlık contalarının uygulanması', order: 3 },
                                { title: 'Üst ve alt ringin birleşim civatalarının sıkılması', order: 4 },
                                { title: 'Silonun krikolardan indirilerek zemine oturtulması', order: 5 }
                            ]
                        }
                    },
                    {
                        title: 'Aksesuar Montajı',
                        order: 4,
                        subSteps: {
                            create: [
                                { title: 'Dış merdiven ve güvenlik kafesinin montajı', order: 1 },
                                { title: 'Servis kapısının montajı', order: 2 },
                                { title: 'Rüzgar ringlerinin (varsa) takılması', order: 3 }
                            ]
                        }
                    },
                    {
                        title: 'Tamamlama ve Teslim',
                        order: 5,
                        subSteps: {
                            create: [
                                { title: 'Silo ankraj cıvatalarının sıkılması', order: 1 },
                                { title: 'Tüm gövde civatalarının tork kontrolü', order: 2 },
                                { title: 'Mastic (silikon) uygulamalarının kontrolü', order: 3 },
                                { title: 'Saha temizliği ve teslimat', order: 4 }
                            ]
                        }
                    }
                ]
            }
        }
    });
    console.log('Created/Updated: 2 Katlı Silo Montajı');

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
