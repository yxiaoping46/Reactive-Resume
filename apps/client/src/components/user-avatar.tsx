import { getInitials } from "@reactive-resume/utils";
import { User } from '@supabase/supabase-js';
import { useUser } from "../services/user";

type Props = {
  size?: number;
  className?: string;
};

export const UserAvatar = ({ size = 36, className }: Props) => {
  const { user } = useUser();

  if (!user) return null;

  let picture: React.ReactNode;

  if (user.user_metadata?.picture) {
    picture = (
      <img
        alt={user.user_metadata?.name || user.email}
        src={user.user_metadata.picture}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    );
  } else {
    const name = user.user_metadata?.name || user.email || 'User';
    const initials = getInitials(name);

    picture = (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full bg-secondary text-center text-[10px] font-semibold text-secondary-foreground"
      >
        {initials}
      </div>
    );
  }

  return <div className={className}>{picture}</div>;
};
