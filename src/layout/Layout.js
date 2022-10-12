import Header from "./Header";

function Layout(props) {
  return (
    <div>
      <Header />
      <main className="flex">
        {props.children}
      </main>
      <footer className="bg-dark flex center-x center-y">
        <p>Copyright © 2022 Stella Lau</p>
      </footer>
    </div>
  );
}
export default Layout;
