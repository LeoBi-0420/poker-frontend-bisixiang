"use client";

interface ConfirmDeleteButtonProps {
  message: string;
  children?: React.ReactNode;
}

export function ConfirmDeleteButton({
  message,
  children = "Delete",
}: ConfirmDeleteButtonProps) {
  return (
    <button
      type="submit"
      className="btn btn-danger"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
