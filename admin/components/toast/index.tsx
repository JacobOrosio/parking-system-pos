import Toast from "react-native-toast-message";

export const CommonToast = () => {
  return (
    <>
      <Toast />
    </>
  );
};

type ShowProps = {
  title: string;
  message: string;
  type: "success" | "error" | "warning";
};

export const CommonToastShow = ({ title, message, type }: ShowProps) => {
  Toast.show({
    text1: title,
    text2: message,
    type,
  });
};
