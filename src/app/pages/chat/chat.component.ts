import { Component, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Chat {
  id: number;
  name: string;
  messages: Message[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked {
  inputText = '';
  username = localStorage.getItem('username') || 'You';
  isTyping = false;

  sidebarClosed = false;

  chats: Chat[] = [
    { id: 1, name: 'Chat 1', messages: [] },
    { id: 2, name: 'Chat 2', messages: [] },
    { id: 3, name: 'New Chat', messages: [] }
  ];

  selectedChat: Chat = this.chats[0];

  get messages(): Message[] {
    return this.selectedChat.messages;
  }

  sendMessage() {
    if (!this.inputText.trim()) return;

    const userMessage: Message = {
      text: this.inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.inputText = '';
    this.isTyping = true;

    setTimeout(() => {
      this.messages.push({
        text: `Echo: ${userMessage.text}`,
        sender: 'bot',
        timestamp: new Date()
      });
      this.isTyping = false;
    }, 1000);
  }

  toggleSidebar() {
    this.sidebarClosed = !this.sidebarClosed;
  }

  selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.sidebarClosed = true;
  }

  ngAfterViewChecked() {
    const el = document.querySelector('.messages');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
