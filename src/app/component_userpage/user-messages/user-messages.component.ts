import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
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
  selector: 'app-user-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './user-messages.component.html',
  styleUrls: ['./user-messages.component.css']
})
export class UserMessagesComponent implements OnInit, OnDestroy {
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
  isMobileView: boolean = false;
  showChat: boolean = false;
  searchQuery: string = '';
  filteredConversations: Conversation[] = [];
  previewImage: string | null = null;

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
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
          // Attempt to reconnect after 5 seconds if not connected
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
      const receiverId = +params['receiverId'];
      if (receiverId) {
        this.receiverId = receiverId;
        this.loadMessages();
      }
    });

    this.filteredConversations = this.conversations;
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (conv: Conversation[]) => {
        this.conversations = conv;
        this.filterConversations();
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
        this.router.navigate(['/user-messages', result.id]);
      }
    });
  }

  selectConversation(receiverId: number) {
    this.receiverId = receiverId;
    this.selectedConversation = this.conversations.find(conv => conv.id === receiverId) || null;
    this.errorMessage = '';
    this.loadMessages();
    if (this.isMobileView) {
      this.showChat = true;
    }
    this.router.navigate(['/user-messages', receiverId]);
  }

  loadMessages() {
    if (this.receiverId) {
      // Mark messages as read when the conversation is loaded
      this.chatService.markAsRead(this.receiverId).subscribe({
        next: () => {
          console.log('Messages marked as read');
          this.loadConversations(); // Refresh conversations to update unread_count
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
            this.errorMessage = err.error?.error || 'You can only message this worker after a confirmed booking.';
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
          // Optimistically add the sent message to the UI
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
            this.errorMessage = err.error?.error || 'You can only message this worker after a confirmed booking.';
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

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer && this.messageContainer.nativeElement) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }

  toggleView() {
    this.showChat = !this.showChat;
  }

  isImageFile(fileType: string | undefined): boolean {
    if (!fileType) return false;
    return ['jpg', 'jpeg', 'png', 'gif'].includes(fileType.toLowerCase());
  }

  openImagePreview(imageUrl: string) {
    this.previewImage = imageUrl;
  }

  closeImagePreview() {
    this.previewImage = null;
  }

  // Function to show profile details (Placeholder)
  showProfileDetails() {
    if (this.selectedConversation) {
      console.log("Show details for user:", this.selectedConversation.id);
      // TODO: Fetch user details from UserService
      // TODO: Open a MatDialog with a new ProfileDetailsComponent
      // Example:
      // this.userService.getUserDetails(this.selectedConversation.id).subscribe(details => {
      //   this.dialog.open(ProfileDetailsDialogComponent, { data: details });
      // });
    } else {
      console.warn("No conversation selected to show details for.");
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnectWebSocket();
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }

  onImageError(event: Event) {
    console.error('Failed to load image:', event);
    (event.target as HTMLImageElement).style.display = 'none'; // Hide the broken image
    // Optionally display a placeholder or error message
  }

  // Search functionality
  filterConversations() {
    if (!this.searchQuery) {
      this.filteredConversations = this.conversations;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredConversations = this.conversations.filter(conv => 
      conv.name.toLowerCase().includes(query) || 
      conv.role.toLowerCase().includes(query) ||
      (conv.latest_message && conv.latest_message.toLowerCase().includes(query))
    );
  }
}

@Component({
  selector: 'app-new-conversation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <h2 mat-dialog-title>Start a New Conversation</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Select a user</mat-label>
        <mat-select [(ngModel)]="selectedUser">
          <mat-option *ngFor="let user of data.potentialUsers" [value]="user">
            {{ user.name }} ({{ user.role }})
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="startConversation()" [disabled]="!selectedUser">Start</button>
    </mat-dialog-actions>
  `,
})
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