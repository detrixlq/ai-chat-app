import { Component, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
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
  messages: Message[] = [];
  username = localStorage.getItem('username') || 'You';
  isTyping = false;

  sendMessage() {
    if (!this.inputText.trim()) return;

    const userMessage = this.inputText.trim();

    this.messages.push({
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    });

    this.inputText = '';
    this.isTyping = true;

    // Фейковый ответ от бота (заменим на реальный позже)
    setTimeout(() => {
      this.messages.push({
        text: `Echo: ${userMessage}`,
        sender: 'bot',
        timestamp: new Date()
      });
      this.isTyping = false;
    }, 1000);
  }
  
  ngAfterViewChecked() {
    const el = document.querySelector('.messages');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
