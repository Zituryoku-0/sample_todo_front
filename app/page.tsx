import Login from "./(public)/login/page";
import Header from "./components/header";

export default function Home() {
  /** TODO:暫定対応、JWTによる認証処理の実装後、認証情報がない場合はログインにリダイレクトするようにする */
  return (
    <Header />
  );
}
