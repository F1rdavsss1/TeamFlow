import { PrismaClient, UserRole, TaskStatus, TaskPriority, ProjectStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash,
      name: 'Alice Johnson',
    },
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash,
      name: 'Bob Smith',
    },
  })

  const carol = await prisma.user.create({
    data: {
      email: 'carol@example.com',
      passwordHash,
      name: 'Carol White',
    },
  })

  const project = await prisma.project.create({
    data: {
      name: 'Запуск интернет-магазина',
      description: 'Разработка и запуск нового интернет-магазина',
      status: ProjectStatus.ACTIVE,
      ownerId: alice.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-01'),
    },
  })

  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: alice.id, role: UserRole.OWNER },
      { projectId: project.id, userId: bob.id, role: UserRole.EDITOR },
      { projectId: project.id, userId: carol.id, role: UserRole.VIEWER },
    ],
  })

  await prisma.task.createMany({
    data: [
      {
        title: 'Сверстать главную страницу',
        description: 'Создать адаптивную главную страницу магазина',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        projectId: project.id,
        assigneeId: bob.id,
        dueDate: new Date('2024-02-15'),
      },
      {
        title: 'Настроить платёжную систему',
        description: 'Интегрировать Stripe для приёма платежей',
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        projectId: project.id,
        assigneeId: alice.id,
        dueDate: new Date('2024-03-01'),
      },
      {
        title: 'Написать описания товаров',
        description: 'Подготовить SEO-оптимизированные описания для 50 товаров',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: project.id,
        assigneeId: carol.id,
        dueDate: new Date('2024-02-28'),
      },
      {
        title: 'Настроить CI/CD',
        description: 'Настроить автоматическое развёртывание через GitHub Actions',
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        projectId: project.id,
        assigneeId: alice.id,
      },
    ],
  })

  console.log('Seed completed')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
