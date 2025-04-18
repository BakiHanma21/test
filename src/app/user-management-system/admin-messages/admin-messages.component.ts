import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

// Define interfaces for type safety
interface ChatMessage {
  id?: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  file_path?: string;
  file_url?: string; // Add file_url to the interface
  file_name?: string;
  file_type?: string;
  created_at: string;
  read_at?: string | null;
}

interface Conversation {
  id: number;
  name: string;
  role: string;
  latest_message: string | null;
  latest_timestamp: string | null;
  unread_count: number;
}

interface PotentialUser {
  id: number;
  name: string;
  role: string;
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [
    RouterModule,
    NgClass,
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './admin-messages.component.html',
  styleUrls: ['./admin-messages.component.css']
})
export class AdminMessagesComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  messages: ChatMessage[] = [];
  conversations: Conversation[] = [];
  newMessage: string = '';
  selectedFile: File | undefined = undefined;
  receiverId: number | null = null;
  isSending: boolean = false;
  currentUserId: number | null = null;
  selectedConversation: Conversation | null = null;
  errorMessage: string = '';
  isConnected: boolean = false;
  potentialUsers: PotentialUser[] = [];
  private subscriptions: Subscription[] = [];
  
  // New properties for modern design
  searchText: string = '';
  isMobileView = false;
  showChat = false;
  
  // Mobile view properties
  showConversations = true;

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private userService: UserService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnInit() {
    const userId = localStorage.getItem('user_id');
    this.currentUserId = userId ? +userId : null;

    if (!this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    this.chatService.initializeWebSocket();

    this.subscriptions.push(
      this.chatService.connectionStatus$.subscribe(status => {
        this.isConnected = status;
        if (status) {
          this.loadConversations();
          this.loadPotentialUsers();
        } else {
          this.errorMessage = 'Unable to connect to the chat server. Retrying...';
          setTimeout(() => {
            if (!this.isConnected) {
              this.chatService.initializeWebSocket();
            }
          }, 5000);
        }
      })
    );

    this.subscriptions.push(
      this.chatService.newMessage$.subscribe(chat => {
        if (chat && this.chatService.isFromActiveConversation(chat, this.receiverId)) {
          const exists = this.messages.some(msg =>
            msg.id === chat.id ||
            (msg.message === chat.message &&
             msg.sender_id === chat.sender_id &&
             msg.created_at === chat.created_at)
          );

          if (!exists) {
            this.messages.push(chat);
            this.scrollToBottom();
          }
        }
        this.loadConversations();
      })
    );

    this.route.params.subscribe(params => {
      this.receiverId = +params['receiverId'] || null;
      if (this.receiverId) {
        this.selectConversation(this.receiverId);
      }
    });
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (conv: Conversation[]) => {
        this.conversations = conv;
        if (this.receiverId) {
          this.selectedConversation = this.conversations.find(c => c.id === this.receiverId) || null;
        }
      },
      error: (err) => {
        console.error('Failed to load conversations:', err);
        this.errorMessage = 'Failed to load conversations. Please try again.';
      }
    });
  }

  loadPotentialUsers() {
    this.userService.getPotentialChatUsers().subscribe({
      next: (users: PotentialUser[]) => {
        this.potentialUsers = users.filter(user => !this.conversations.some(conv => conv.id === user.id));
      },
      error: (err) => {
        console.error('Failed to load potential users:', err);
        this.errorMessage = 'Failed to load potential users. Please try again.';
      }
    });
  }

  openNewConversationDialog() {
    const dialogRef = this.dialog.open(NewConversationDialogComponent, {
      width: '400px',
      data: { potentialUsers: this.potentialUsers }
    });

    dialogRef.afterClosed().subscribe((result: PotentialUser) => {
      if (result) {
        this.receiverId = result.id;
        this.selectedConversation = {
          id: result.id,
          name: result.name,
          role: result.role,
          latest_message: null,
          latest_timestamp: null,
          unread_count: 0
        };
        this.loadMessages();
        this.router.navigate(['/admin-messages', result.id]);
      }
    });
  }

  selectConversation(receiverId: number) {
    this.receiverId = receiverId;
    this.selectedConversation = this.conversations.find(conv => conv.id === receiverId) || null;
    this.errorMessage = '';
    this.loadMessages();
    this.router.navigate(['/admin-messages', receiverId]);
  }

  loadMessages() {
    if (this.receiverId) {
      this.chatService.markAsRead(this.receiverId).subscribe({
        next: () => {
          console.log('Messages marked as read');
          this.loadConversations();
        },
        error: (err) => console.error('Failed to mark messages as read:', err)
      });

      this.chatService.getMessages(this.receiverId).subscribe({
        next: (data: ChatMessage[]) => {
          this.messages = data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Failed to load messages:', err);
          if (err.status === 403) {
            this.errorMessage = err.error?.error || 'You can only message this user after a confirmed booking.';
            this.messages = [];
          } else if (err.status === 500) {
            this.errorMessage = 'An error occurred while loading messages. Please try again later.';
            this.messages = [];
          } else {
            this.errorMessage = 'Failed to load messages. Please try again.';
            this.messages = [];
          }
        }
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  sendMessage() {
    if (this.receiverId && (this.newMessage.trim() || this.selectedFile)) {
      this.isSending = true;
      this.errorMessage = '';
      const messageToSend: ChatMessage = {
        sender_id: this.currentUserId!,
        receiver_id: this.receiverId,
        message: this.newMessage,
        created_at: new Date().toISOString(),
        read_at: null
      };

      this.chatService.sendMessage(this.receiverId, this.newMessage, this.selectedFile).subscribe({
        next: (response: any) => {
          const sentMessage: ChatMessage = {
            ...messageToSend,
            id: response.chat?.id,
            file_path: response.chat?.file_path,
            file_url: response.chat?.file_url, // Use file_url from the response
            file_name: response.chat?.file_name,
            file_type: response.chat?.file_type
          };
          this.messages.push(sentMessage);
          this.scrollToBottom();

          this.newMessage = '';
          this.selectedFile = undefined;
          this.fileInput.nativeElement.value = '';
          this.isSending = false;
          this.loadConversations();
        },
        error: (err) => {
          console.error('Failed to send message:', err);
          this.isSending = false;
          if (err.status === 403) {
            this.errorMessage = err.error?.error || 'You can only message this user after a confirmed booking.';
          } else {
            this.errorMessage = 'Failed to send message. Please try again.';
          }
        }
      });
    }
  }

  // getFileUrl(filePath: string): string {
  //   return `${environment.apiUrl}/storage/${filePath}`;
  // }

  onImageError(event: Event) {
    console.error('Failed to load image:', event);
    (event.target as HTMLImageElement).style.display = 'none'; // Hide the broken image
    // Optionally display a placeholder or error message
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer && this.messageContainer.nativeElement) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSidebarInside() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.chatService.disconnectWebSocket();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'http://localhost:4200/login';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnectWebSocket();
    window.removeEventListener('resize', () => this.checkScreenSize());
  }
  
  // New methods for modern design
  private checkScreenSize() {
    this.isMobileView = window.innerWidth < 768;
    if (!this.isMobileView) {
      this.showConversations = true;
    }
  }

  toggleView() {
    this.showChat = !this.showChat;
  }

  onSearch() {
    // Simple search implementation that doesn't modify the original conversations array
    if (!this.searchText) {
      this.loadConversations();
      return;
    }

    const searchTerm = this.searchText.toLowerCase();
    this.conversations = this.conversations.filter(conv => 
      conv.name.toLowerCase().includes(searchTerm) || 
      conv.role.toLowerCase().includes(searchTerm) ||
      (conv.latest_message && conv.latest_message.toLowerCase().includes(searchTerm))
    );
  }

  isImageType(fileType: string | undefined): boolean {
    if (!fileType) return false;
    return ['jpg', 'jpeg', 'png', 'gif'].includes(fileType.toLowerCase());
  }

  viewProfile() {
    // Simple alert for now - you can implement your own profile view logic
    alert('View profile functionality will be implemented here');
  }

  toggleConversations() {
    this.showConversations = !this.showConversations;
  }
}

export class NewConversationDialogComponent {
  selectedUser: PotentialUser | null = null;

  constructor(
    public dialogRef: MatDialogRef<NewConversationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { potentialUsers: PotentialUser[] }
  ) {}

  startConversation() {
    if (this.selectedUser) {
      this.dialogRef.close(this.selectedUser);
    }
  }
}