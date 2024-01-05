export interface IMessage{
    id: string;
    content: string;
    role: 'user' | 'model';
    createdAt: Date;
}