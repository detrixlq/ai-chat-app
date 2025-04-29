import { Component, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

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
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked {
  inputText = '';
  username = localStorage.getItem('username') || 'You'; // Get username from localStorage
  isTyping = false;

  sidebarClosed = true;

  chats: Chat[] = [
    { id: 1, name: 'Chat 1', messages: [] },
    { id: 2, name: 'Chat 2', messages: [] },
    { id: 3, name: 'New Chat', messages: [] }
  ];

  selectedChat: Chat = this.chats[0];

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(private http: HttpClient) {}

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

    // Add user message to the selected chat's message list
    this.selectedChat.messages.push(userMessage);
    this.inputText = '';
    this.isTyping = true;

    const apiUrl = `http://127.0.0.1:8000/chat`;

    // Send message to backend with both 'prompt' and 'username'
    this.http.post<{ response: string }>(apiUrl, {
      prompt: userMessage.text,
      username: this.username // Send the username here
    }).subscribe({
      next: (response) => {
        // Add bot's response to the selected chat's message list
        this.selectedChat.messages.push({
          text: response.response, // Ensure this matches your backend's response structure
          sender: 'bot',
          timestamp: new Date()
        });
        this.isTyping = false;
      },
      error: (error) => {
        console.error('Error:', error);
        // Add error message if the backend fails
        this.selectedChat.messages.push({
          text: 'Oops, something went wrong. Try again later.',
          sender: 'bot',
          timestamp: new Date()
        });
        this.isTyping = false;
      }
    });
  }

  toggleSidebar() {
    this.sidebarClosed = !this.sidebarClosed;
  }

  selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.sidebarClosed = true;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
