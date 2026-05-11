/**
 * Seed inicial do banco de dados UFRA Eventos
 * Cria: admin, organizador, participante, categorias e evento de exemplo
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados UFRA Eventos...\n');

  // =========================================================
  // 1. CATEGORIAS
  // =========================================================
  console.log('📂 Criando categorias...');
  
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'semana-academica' },
      update: {},
      create: {
        name: 'Semana Acadêmica',
        slug: 'semana-academica',
        description: 'Semanas acadêmicas dos cursos',
        color: '#1B5E20',
        icon: '🎓',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'workshop' },
      update: {},
      create: {
        name: 'Workshop',
        slug: 'workshop',
        description: 'Oficinas práticas e workshops',
        color: '#F9A825',
        icon: '🛠️',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'congresso' },
      update: {},
      create: {
        name: 'Congresso',
        slug: 'congresso',
        description: 'Congressos científicos e acadêmicos',
        color: '#1565C0',
        icon: '🏛️',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'minicurso' },
      update: {},
      create: {
        name: 'Minicurso',
        slug: 'minicurso',
        description: 'Minicursos e treinamentos',
        color: '#6A1B9A',
        icon: '📚',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'palestra' },
      update: {},
      create: {
        name: 'Palestra',
        slug: 'palestra',
        description: 'Palestras e conferências',
        color: '#00838F',
        icon: '🎤',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'simpósio' },
      update: {},
      create: {
        name: 'Simpósio',
        slug: 'simposio',
        description: 'Simpósios e encontros científicos',
        color: '#BF360C',
        icon: '🔬',
      },
    }),
  ]);

  console.log(`  ✅ ${categories.length} categorias criadas\n`);

  // =========================================================
  // 2. USUÁRIOS
  // =========================================================
  console.log('👥 Criando usuários...');
  
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const orgPasswordHash = await bcrypt.hash('Org@12345', 10);
  const partPasswordHash = await bcrypt.hash('Part@12345', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ufra.edu.br' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Administrador UFRA',
      email: 'admin@ufra.edu.br',
      password: passwordHash,
      role: 'ADMIN',
      institution: 'UFRA Campus Paragominas',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
  });

  // Organizador
  const organizer = await prisma.user.upsert({
    where: { email: 'organizador@ufra.edu.br' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Prof. Carlos Silva',
      email: 'organizador@ufra.edu.br',
      password: orgPasswordHash,
      role: 'ORGANIZER',
      cpf: '111.111.111-11',
      phone: '(91) 99999-0001',
      institution: 'UFRA Campus Paragominas',
      course: 'Ciências Agrárias',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
  });

  // Participante de exemplo
  const participant = await prisma.user.upsert({
    where: { email: 'joao.silva@discente.ufra.edu.br' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'João Pedro Silva',
      email: 'joao.silva@discente.ufra.edu.br',
      password: partPasswordHash,
      role: 'PARTICIPANT',
      cpf: '222.222.222-22',
      matricula: '2021001001',
      phone: '(91) 98888-0001',
      institution: 'UFRA Campus Paragominas',
      course: 'Agronomia',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
  });

  console.log('  ✅ Usuários criados:');
  console.log(`     👤 Admin: admin@ufra.edu.br / Admin@123`);
  console.log(`     👤 Organizador: organizador@ufra.edu.br / Org@12345`);
  console.log(`     👤 Participante: joao.silva@discente.ufra.edu.br / Part@12345\n`);

  // =========================================================
  // 3. EVENTO DE EXEMPLO
  // =========================================================
  console.log('📅 Criando eventos de exemplo...');

  const semanaCategory = categories.find(c => c.slug === 'semana-academica');
  const congressoCategory = categories.find(c => c.slug === 'congresso');

  const event1 = await prisma.event.upsert({
    where: { slug: 'semana-academica-agronomia-2024' },
    update: {},
    create: {
      title: 'IX Semana Acadêmica de Agronomia',
      slug: 'semana-academica-agronomia-2024',
      description: `A IX Semana Acadêmica de Agronomia da UFRA Campus Paragominas é um dos maiores eventos científicos e acadêmicos da região. 
      
      Com o tema "Agronomia Sustentável para a Amazônia do Futuro", o evento reúne estudantes, professores, pesquisadores e profissionais para a troca de experiências e conhecimentos sobre as mais recentes inovações na área agrícola.
      
      Serão realizadas palestras, minicursos, mesas-redondas e apresentação de trabalhos científicos durante cinco dias de intensa programação.`,
      shortDescription: 'O maior evento acadêmico de Agronomia da UFRA Campus Paragominas.',
      startDate: new Date('2024-10-14T08:00:00'),
      endDate: new Date('2024-10-18T18:00:00'),
      registrationDeadline: new Date('2024-10-10T23:59:59'),
      location: 'UFRA Campus Paragominas',
      address: 'Rodovia PA-256, Km 02, s/n – Abelha, Paragominas – PA, 68625-000',
      isOnline: false,
      workload: 40,
      maxParticipants: 500,
      status: 'PUBLISHED',
      isFeatured: true,
      isPublic: true,
      acceptsSubmissions: true,
      submissionDeadline: new Date('2024-09-30T23:59:59'),
      submissionGuidelines: 'Os trabalhos devem ser submetidos em formato PDF, com no mínimo 4 e no máximo 10 páginas, seguindo as normas da ABNT.',
      organizerId: organizer.id,
      categoryId: semanaCategory?.id,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { slug: 'i-congresso-ciencias-agrarias-amazonia' },
    update: {},
    create: {
      title: 'I Congresso de Ciências Agrárias da Amazônia',
      slug: 'i-congresso-ciencias-agrarias-amazonia',
      description: `O I Congresso de Ciências Agrárias da Amazônia é um evento de abrangência regional que reúne pesquisadores, professores e estudantes de diversas instituições de ensino superior da região Norte.
      
      O congresso tem como objetivo promover a integração entre a pesquisa científica e as demandas do setor produtivo, com foco no desenvolvimento sustentável da Amazônia.`,
      shortDescription: 'Congresso científico regional com foco no desenvolvimento agrário sustentável da Amazônia.',
      startDate: new Date('2024-11-20T08:00:00'),
      endDate: new Date('2024-11-23T18:00:00'),
      registrationDeadline: new Date('2024-11-15T23:59:59'),
      location: 'Auditório Principal – UFRA Campus Paragominas',
      address: 'Rodovia PA-256, Km 02, s/n – Abelha, Paragominas – PA, 68625-000',
      isOnline: false,
      workload: 30,
      maxParticipants: 300,
      status: 'PUBLISHED',
      isFeatured: true,
      isPublic: true,
      acceptsSubmissions: true,
      submissionDeadline: new Date('2024-11-01T23:59:59'),
      submissionGuidelines: 'Artigos completos devem ter entre 8 e 15 páginas. Resumos expandidos entre 2 e 4 páginas.',
      organizerId: organizer.id,
      categoryId: congressoCategory?.id,
    },
  });

  // Evento de workshop
  const workshopCategory = categories.find(c => c.slug === 'workshop');
  const event3 = await prisma.event.upsert({
    where: { slug: 'workshop-drones-agricultura-precisao' },
    update: {},
    create: {
      title: 'Workshop de Drones e Agricultura de Precisão',
      slug: 'workshop-drones-agricultura-precisao',
      description: `Aprenda na prática o uso de drones e tecnologias de agricultura de precisão para monitoramento e manejo de lavouras.
      
      O workshop incluirá demonstrações práticas com drones agrícolas, análise de imagens multiespectrais, uso de NDVI para monitoramento de culturas e introdução ao software de gestão agrícola.`,
      shortDescription: 'Workshop prático sobre uso de drones e tecnologias de precisão na agricultura.',
      startDate: new Date('2024-09-07T08:00:00'),
      endDate: new Date('2024-09-07T17:00:00'),
      registrationDeadline: new Date('2024-09-05T23:59:59'),
      location: 'Laboratório de Geotecnologias – UFRA',
      address: 'Bloco C – UFRA Campus Paragominas',
      isOnline: false,
      workload: 8,
      maxParticipants: 30,
      status: 'FINISHED',
      isFeatured: false,
      isPublic: true,
      acceptsSubmissions: false,
      organizerId: organizer.id,
      categoryId: workshopCategory?.id,
    },
  });

  console.log(`  ✅ 3 eventos criados\n`);

  // =========================================================
  // 4. PALESTRANTES
  // =========================================================
  console.log('🎤 Criando palestrantes...');

  await prisma.speaker.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Dr. Fernando Augusto Costa',
        bio: 'Doutor em Ciências Agrárias pela UFPA. Pesquisador em sistemas agroflorestais e sustentabilidade na Amazônia.',
        title: 'Prof. Doutor',
        institution: 'Universidade Federal do Pará – UFPA',
        eventId: event1.id,
      },
      {
        name: 'Dra. Ana Paula Ferreira',
        bio: 'Doutora em Fitotecnia pela ESALQ/USP. Especialista em manejo integrado de pragas e doenças em culturas tropicais.',
        title: 'Profa. Doutora',
        institution: 'EMBRAPA Amazônia Oriental',
        eventId: event1.id,
      },
      {
        name: 'MSc. Ricardo Almeida',
        bio: 'Mestre em Agronomia pela UFRA. Especialista em agricultura de precisão e uso de geotecnologias no campo.',
        title: 'Eng. Agrônomo, MSc.',
        institution: 'UFRA Campus Paragominas',
        eventId: event1.id,
      },
    ],
  });

  console.log('  ✅ Palestrantes criados\n');

  // =========================================================
  // 5. PROGRAMAÇÃO
  // =========================================================
  console.log('📋 Criando programação...');

  const speakers = await prisma.speaker.findMany({ where: { eventId: event1.id } });
  const speaker1 = speakers[0];
  const speaker2 = speakers[1];

  await prisma.schedule.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Abertura Oficial e Boas-Vindas',
        description: 'Cerimônia de abertura com autoridades da UFRA',
        startTime: new Date('2024-10-14T08:00:00'),
        endTime: new Date('2024-10-14T09:00:00'),
        location: 'Auditório Principal',
        type: 'Cerimônia',
        eventId: event1.id,
      },
      {
        title: 'Palestra Magna: Agronomia Sustentável e os Desafios da Amazônia',
        description: 'Apresentação sobre os principais desafios e oportunidades para a agronomia sustentável na região amazônica.',
        startTime: new Date('2024-10-14T09:30:00'),
        endTime: new Date('2024-10-14T11:00:00'),
        location: 'Auditório Principal',
        type: 'Palestra',
        eventId: event1.id,
        speakerId: speaker1?.id,
      },
      {
        title: 'Minicurso: Manejo Integrado de Pragas',
        description: 'Curso prático sobre técnicas de manejo integrado de pragas nas principais culturas da região.',
        startTime: new Date('2024-10-14T14:00:00'),
        endTime: new Date('2024-10-14T17:00:00'),
        location: 'Laboratório de Fitopatologia',
        type: 'Minicurso',
        eventId: event1.id,
        speakerId: speaker2?.id,
      },
      {
        title: 'Mesa Redonda: O Futuro da Agricultura Familiar na Amazônia',
        description: 'Debate entre especialistas sobre perspectivas e políticas para agricultura familiar na região.',
        startTime: new Date('2024-10-15T09:00:00'),
        endTime: new Date('2024-10-15T11:00:00'),
        location: 'Auditório Principal',
        type: 'Mesa Redonda',
        eventId: event1.id,
      },
      {
        title: 'Apresentação de Trabalhos Científicos – Sessão 1',
        description: 'Apresentação de artigos selecionados na área de fitotecnia e produção vegetal.',
        startTime: new Date('2024-10-15T14:00:00'),
        endTime: new Date('2024-10-15T17:00:00'),
        location: 'Sala 201 – Bloco A',
        type: 'Apresentação',
        eventId: event1.id,
      },
      {
        title: 'Encerramento e Entrega de Certificados',
        description: 'Cerimônia de encerramento com entrega de certificados e premiação dos melhores trabalhos.',
        startTime: new Date('2024-10-18T16:00:00'),
        endTime: new Date('2024-10-18T18:00:00'),
        location: 'Auditório Principal',
        type: 'Cerimônia',
        eventId: event1.id,
      },
    ],
  });

  console.log('  ✅ Programação criada\n');

  // =========================================================
  // RESUMO FINAL
  // =========================================================
  console.log('=' .repeat(60));
  console.log('✅ SEED CONCLUÍDO COM SUCESSO!');
  console.log('=' .repeat(60));
  console.log('\n📊 Resumo do banco de dados:');
  
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.category.count(),
    prisma.speaker.count(),
    prisma.schedule.count(),
  ]);

  console.log(`   👥 Usuários: ${counts[0]}`);
  console.log(`   📅 Eventos: ${counts[1]}`);
  console.log(`   📂 Categorias: ${counts[2]}`);
  console.log(`   🎤 Palestrantes: ${counts[3]}`);
  console.log(`   📋 Programações: ${counts[4]}`);
  
  console.log('\n🔐 Credenciais de acesso:');
  console.log('   Admin:        admin@ufra.edu.br         | Admin@123');
  console.log('   Organizador:  organizador@ufra.edu.br   | Org@12345');
  console.log('   Participante: joao.silva@discente.ufra.edu.br | Part@12345');
  console.log('\n🚀 Sistema pronto para uso!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
