import Sidebar from "../../components/SideBar";
import Categories from "../../components/CategorySelect";
import SearchBar from "../../components/SearchBar";
import Tabs from "../../components/Tabs";

export default function Home({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <main>
        <SearchBar />
        <Tabs />
        {children}
      </main>

      <Categories />
    </div>
  );
}
