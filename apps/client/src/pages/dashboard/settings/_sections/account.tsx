import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
import { Check, UploadSimple, Warning } from "@phosphor-icons/react";
import type { UpdateUserDto } from "@reactive-resume/dto";
import { updateUserSchema } from "@reactive-resume/dto";
import {
  Button,
  buttonVariants,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { UserAvatar } from "@/client/components/user-avatar";
import { useToast } from "@/client/hooks/use-toast";
import { useSupabase } from "@/client/providers/supabase.provider";
import { useUser } from "@/client/services/user";

export const AccountSettings = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateUserDto>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      picture: "",
      name: "",
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    user && onReset();
  }, [user]);

  const onReset = () => {
    if (!user) return;

    form.reset({
      picture: user.picture ?? "",
      name: user.name,
      username: user.username,
      email: user.email,
    });
  };

  const onSubmit = async (data: UpdateUserDto) => {
    if (!user) return;

    try {
      // Update email if changed
      if (user.email !== data.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: data.email 
        });
        
        if (emailError) throw emailError;

        toast({
          variant: "info",
          title: t`Check your email for the confirmation link to update your email address.`,
        });
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.name,
          username: data.username,
          picture: data.picture,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        variant: "success",
        title: t`Your account has been updated successfully.`,
      });

      form.reset(data);
    } catch (error) {
      toast({
        variant: "error",
        title: t`Failed to update your account.`,
        description: error.message,
      });
    }
  };

  const onSelectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.length) return;

    try {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/profile.${fileExt}`;

      // Upload image to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new picture URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ picture: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        variant: "success",
        title: t`Profile picture updated successfully.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: t`Failed to upload profile picture.`,
        description: error.message,
      });
    }
  };

  const onResendVerificationEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email,
      });

      if (error) throw error;

      toast({ 
        variant: "success", 
        title: t`Verification email has been sent.` 
      });
    } catch (error) {
      toast({
        variant: "error",
        title: t`Failed to send verification email.`,
        description: error.message,
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold leading-relaxed tracking-tight">{t`Account`}</h3>
        <p className="leading-relaxed opacity-75">
          {t`Here, you can update your account information such as your profile picture, name and username.`}
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-6 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="picture"
            control={form.control}
            render={({ field, fieldState: { error } }) => (
              <div className={cn("flex items-end gap-x-4 sm:col-span-2", error && "items-center")}>
                <UserAvatar />

                <FormItem className="flex-1">
                  <FormLabel>{t`Picture`}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                {!user.picture && (
                  <>
                    <input ref={inputRef} hidden type="file" onChange={onSelectImage} />

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(buttonVariants({ size: "icon", variant: "ghost" }))}
                      onClick={() => inputRef.current?.click()}
                    >
                      <UploadSimple />
                    </motion.button>
                  </>
                )}
              </div>
            )}
          />

          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Name`}</FormLabel>
                <FormControl>
                  <Input autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="username"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Username`}</FormLabel>
                <FormControl>
                  <Input autoComplete="username" className="lowercase" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Email`}</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" className="lowercase" {...field} />
                </FormControl>
                <FormDescription
                  className={cn(
                    "flex items-center gap-x-1.5 font-medium opacity-100",
                    user.emailVerified ? "text-success-accent" : "text-warning-accent",
                  )}
                >
                  {user.emailVerified ? <Check size={12} /> : <Warning size={12} />}
                  {user.emailVerified ? t`Verified` : t`Unverified`}
                  {!user.emailVerified && (
                    <Button
                      variant="link"
                      className="h-auto text-xs"
                      onClick={onResendVerificationEmail}
                    >
                      {t`Resend email confirmation link`}
                    </Button>
                  )}
                </FormDescription>
              </FormItem>
            )}
          />

          <AnimatePresence presenceAffectsLayout>
            {form.formState.isDirty && (
              <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center space-x-2 self-center sm:col-start-2"
              >
                <Button type="submit" disabled={loading}>
                  {t`Save Changes`}
                </Button>
                <Button type="reset" variant="ghost" onClick={onReset}>
                  {t`Discard`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
};
