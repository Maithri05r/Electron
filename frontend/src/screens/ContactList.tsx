import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, User, Settings, LogOut } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  unreadCount?: number;
  ipAddress: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
}

interface CurrentUser {
  id: string;
  name: string;
  ipAddress: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

interface ContactListProps {
  currentUser: CurrentUser;
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
}

export function ContactList({
  currentUser,
  contacts,
  selectedContactId,
  onSelectContact,
}: ContactListProps) {
  return (
    <div
      className="flex flex-col h-full shadow-lg"
      style={{ background: 'linear-gradient(to bottom, #C5D9DD, #B5CDD2)' }}
    >
      {/* User Profile Section */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-b" style={{ borderColor: '#A7C4CA' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2" style={{ borderColor: '#6B9AA4' }}>
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback style={{ backgroundColor: '#A7CAD0', color: '#2D464D' }}>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate" style={{ color: '#2D464D' }}>
              {currentUser.name}
            </h3>
            <p className="text-xs truncate" style={{ color: '#6B9AA4' }}>
              {currentUser.ipAddress}
            </p>
            <p className="text-xs truncate" style={{ color: '#89B2BA' }}>
              {/* {currentUser.location.city}, {currentUser.location.country} */}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/50"
              style={{ color: '#4D7A82' }}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/50"
              style={{ color: '#4D7A82' }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="p-4 bg-white/60 backdrop-blur-sm">
        <h2 className="mb-3" style={{ color: '#2D464D' }}>
          Messages
        </h2>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: '#6B9AA4' }}
          />
          <Input
            placeholder="Search contacts..."
            className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
            style={{ borderColor: '#A7CAD0' }}
          />
        </div>
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className="w-full flex items-start gap-3 p-4 rounded-lg transition-colors hover:bg-white/50"
              style={
                selectedContactId === contact.id
                  ? { backgroundColor: '#89B2BA', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
                  : {}
              }
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback style={{ backgroundColor: '#A7CAD0', color: '#2D464D' }}>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    contact.status === 'online'
                      ? 'bg-emerald-400'
                      : contact.status === 'away'
                        ? 'bg-amber-400'
                        : 'bg-gray-400'
                  }`}
                />
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="truncate" style={{ color: '#2D464D' }}>
                    {contact.name}
                  </span>
                  {contact.unreadCount && contact.unreadCount > 0 && (
                    <Badge
                      variant="default"
                      className="rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 text-white"
                      style={{ backgroundColor: '#4D7A82' }}
                    >
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-sm truncate mb-0.5" style={{ color: '#6B9AA4' }}>
                  {contact.ipAddress}
                </p>
                <p className="text-sm truncate" style={{ color: '#89B2BA' }}>
                  {/* {contact.location.city}, {contact.location.country} */}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
