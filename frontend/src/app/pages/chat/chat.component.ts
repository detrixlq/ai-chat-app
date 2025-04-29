import { Component, AfterViewChecked, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
export class ChatComponent implements AfterViewChecked, OnInit {
  inputText = '';
  username = 'You'; // Initialize with fallback
  isTyping = false;

  sidebarClosed = true;
  chats: Chat[] = [];
  selectedChat: Chat | null = null;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        this.username = storedUsername;
      }
    }
  }

  ngOnInit() {
    this.fetchUserChats();
  }

  get messages(): Message[] {
    return this.selectedChat?.messages || [];
  }

  fetchUserChats() {
    this.http.get<Chat[]>(`http://127.0.0.1:8000/chats?username=${this.username}`)
      .subscribe({
        next: (response) => {
          this.chats = response;
          if (this.chats.length > 0) {
            this.selectedChat = this.chats[0];
            this.fetchMessages(this.selectedChat.id);
          }
        },
        error: (err) => console.error('Failed to load chats:', err)
      });
  }

  fetchMessages(chatId: number) {
    this.http.get<Message[]>(`http://127.0.0.1:8000/chats/${chatId}/messages`)
      .subscribe({
        next: (messages) => {
          if (this.selectedChat) {
            this.selectedChat.messages = messages;
          }
        },
        error: (err) => console.error('Failed to load messages:', err)
      });
  }

  createNewChat() {
    const chatName = `Chat ${this.chats.length + 1}`;
    this.http.post<Chat>('http://127.0.0.1:8000/chats', {
      username: this.username,
      name: chatName
    }).subscribe({
      next: (newChat) => {
        newChat.messages = [];
        this.chats.push(newChat);
        this.selectChat(newChat);
      },
      error: (err) => console.error('Failed to create chat:', err)
    });
  }

  sendMessage() {
    console.log('Send message clicked');
    if (!this.inputText.trim() || !this.selectedChat) return;
  
    const userMessage: Message = {
      text: this.inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };
  
    this.selectedChat.messages.push(userMessage);
    this.inputText = '';
    this.isTyping = true;
  
    this.http.post<{ response: string }>('http://127.0.0.1:8000/chat', {
      prompt: userMessage.text,
      username: this.username,
      chat_id: this.selectedChat.id
    }).subscribe({
      next: (response) => {
        this.selectedChat!.messages.push({
          text: response.response,
          sender: 'bot',
          timestamp: new Date()
        });
        this.isTyping = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.selectedChat!.messages.push({
          text: 'Oops, something went wrong.',
          sender: 'bot',
          timestamp: new Date()
        });
        this.isTyping = false;
      }
    });
  }
  

  selectChat(chat: Chat) {
    this.selectedChat = chat;
    this.sidebarClosed = true;
    this.fetchMessages(chat.id);
  }

  toggleSidebar() {
    this.sidebarClosed = !this.sidebarClosed;
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
