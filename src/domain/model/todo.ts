export class TodoM {
  id: number
  content: string
  isDone: boolean
  createdDate: Date
  updatedDate: Date

  markAsDone(): void {
    this.isDone = true
    this.updatedDate = new Date()
  }

  markAsUndone(): void {
    this.isDone = false
    this.updatedDate = new Date()
  }
}
