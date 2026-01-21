import nodemailer from 'nodemailer'

// Create transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD, // Support both SMTP_PASS and SMTP_PASSWORD
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      html,
    })

    console.log('Email sent successfully:', info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export async function sendTaskAssignmentEmail({
  employeeEmail,
  employeeName,
  taskTitle,
  taskDescription,
  projectName,
  dueDate,
}: {
  employeeEmail: string
  employeeName: string
  taskTitle: string
  taskDescription?: string | null
  projectName: string
  dueDate?: Date | null
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: #2563eb; }
          .task-details { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .task-details p { margin: 8px 0; }
          .label { font-weight: bold; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>New Task Assigned</h2>
          <p>Hi ${employeeName},</p>
          <p>You have been assigned a new task:</p>

          <div class="task-details">
            <h3>${taskTitle}</h3>
            <p><span class="label">Project:</span> ${projectName}</p>
            ${taskDescription ? `<p><span class="label">Description:</span> ${taskDescription}</p>` : ''}
            ${dueDate ? `<p><span class="label">Due Date:</span> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
          </div>

          <p>Please log in to view and manage your tasks.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: employeeEmail,
    subject: `New Task Assigned: ${taskTitle}`,
    html,
  })
}

export async function sendTaskCompletionEmail({
  adminEmail,
  employeeName,
  taskTitle,
  projectName,
  completedAt,
}: {
  adminEmail: string
  employeeName: string
  taskTitle: string
  projectName: string
  completedAt: Date
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: #059669; }
          .task-details { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .task-details p { margin: 8px 0; }
          .label { font-weight: bold; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Task Completed</h2>
          <p>The following task has been marked as completed:</p>

          <div class="task-details">
            <h3>${taskTitle}</h3>
            <p><span class="label">Project:</span> ${projectName}</p>
            <p><span class="label">Completed by:</span> ${employeeName}</p>
            <p><span class="label">Completed at:</span> ${completedAt.toLocaleString()}</p>
          </div>

          <p>Please log in to review and manage the task.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: adminEmail,
    subject: `Task Completed: ${taskTitle}`,
    html,
  })
}
