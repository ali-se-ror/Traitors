import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, User } from "lucide-react";

interface Player {
  id: string;
  username: string;
  symbol?: string;
  profileImage?: string;
  createdAt: string;
}

interface PlayerCardProps {
  player: Player;
  isCurrentUser: boolean;
  selected?: boolean;
  onClick?: () => void;
  "data-testid"?: string;
}

export function PlayerCard({ player, isCurrentUser, selected = false, onClick, "data-testid": testId }: PlayerCardProps) {
  const statusColor = "bg-emerald-500/20 text-emerald-400";
  const statusText = "ONLINE";

  return (
    <motion.div
      className={`player-card bg-muted/50 border rounded-xl p-4 transition-all duration-300 ${
        selected ? "selected" : ""
      } ${onClick ? "cursor-pointer hover:bg-primary/5" : ""}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      data-testid={testId}
    >
      <div className="flex items-center space-x-4">
        <Avatar className="w-12 h-12 border border-border">
          {player.profileImage && (
            <AvatarImage src={player.profileImage} alt={`${player.username}'s avatar`} />
          )}
          <AvatarFallback className="bg-slate-800 text-2xl">
            {player.symbol || player.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-foreground truncate" data-testid={`text-player-name-${player.id}`}>
              {player.username}
            </p>
            {isCurrentUser && <Crown className="h-4 w-4 text-secondary flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">
            {isCurrentUser ? "You" : "Player"}
          </p>
        </div>
        <Badge className={`${statusColor} px-3 py-1 text-xs font-medium flex-shrink-0`}>
          {statusText}
        </Badge>
      </div>
    </motion.div>
  );
}
