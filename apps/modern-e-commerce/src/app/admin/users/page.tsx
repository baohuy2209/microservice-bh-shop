import { User, columns } from "./columns";
import { DataTable } from "./data-table";

const getData = async (): Promise<User[]> => {
  return [
    {
      id: "728ed521",
      avatar: "https://i.pravatar.cc/150?img=1",
      status: "active",
      fullName: "John Doe",
      email: "johndoe@gmail.com",
    },
    {
      id: "728ed522",
      avatar: "https://i.pravatar.cc/150?img=2",
      status: "active",
      fullName: "Jane Doe",
      email: "janedoe@gmail.com",
    },
    {
      id: "728ed523",
      avatar: "https://i.pravatar.cc/150?img=3",
      status: "inactive",
      fullName: "Mike Galloway",
      email: "mikegalloway@gmail.com",
    },
    {
      id: "728ed524",
      avatar: "https://i.pravatar.cc/150?img=4",
      status: "inactive",
      fullName: "Minerva Robinson",
      email: "minerbarobinson@gmail.com",
    },
    {
      id: "728ed525",
      avatar: "https://i.pravatar.cc/150?img=5",
      status: "active",
      fullName: "Mable Clayton",
      email: "mableclayton@gmail.com",
    },
    {
      id: "728ed526",
      avatar: "https://i.pravatar.cc/150?img=6",
      status: "active",
      fullName: "Nathan McDaniel",
      email: "nathanmcdaniel@gmail.com",
    },
    {
      id: "728ed527",
      avatar: "https://i.pravatar.cc/150?img=7",
      status: "active",
      fullName: "Myrtie Lamb",
      email: "myrtielamb@gmail.com",
    },
    {
      id: "728ed528",
      avatar: "https://i.pravatar.cc/150?img=8",
      status: "active",
      fullName: "Leona Bryant",
      email: "leonabryant@gmail.com",
    },
    {
      id: "728ed529",
      avatar: "https://i.pravatar.cc/150?img=9",
      status: "inactive",
      fullName: "Aaron Willis",
      email: "aaronwillis@gmail.com",
    },
    {
      id: "728ed52a",
      avatar: "https://i.pravatar.cc/150?img=10",
      status: "active",
      fullName: "Joel Keller",
      email: "joelkeller@gmail.com",
    },
    {
      id: "728ed52b",
      avatar: "https://i.pravatar.cc/150?img=11",
      status: "active",
      fullName: "Daniel Ellis",
      email: "danielellis@gmail.com",
    },
    {
      id: "728ed52c",
      avatar: "https://i.pravatar.cc/150?img=12",
      status: "active",
      fullName: "Gordon Kennedy",
      email: "gordonkennedy@gmail.com",
    },
    {
      id: "728ed52d",
      avatar: "https://i.pravatar.cc/150?img=13",
      status: "inactive",
      fullName: "Emily Hoffman",
      email: "emilyhoffman@gmail.com",
    },
    {
      id: "728ed52e",
      avatar: "https://i.pravatar.cc/150?img=14",
      status: "active",
      fullName: "Jeffery Garrett",
      email: "jefferygarrett@gmail.com",
    },
    {
      id: "728ed52f",
      avatar: "https://i.pravatar.cc/150?img=15",
      status: "active",
      fullName: "Ralph Baker",
      email: "ralphbaker@gmail.com",
    },
    {
      id: "728ed52g",
      avatar: "https://i.pravatar.cc/150?img=16",
      status: "inactive",
      fullName: "Seth Fields",
      email: "sethfields@gmail.com",
    },
    {
      id: "728ed52h",
      avatar: "https://i.pravatar.cc/150?img=17",
      status: "active",
      fullName: "Julia Webb",
      email: "juliawebb@gmail.com",
    },
    {
      id: "728ed52i",
      avatar: "https://i.pravatar.cc/150?img=18",
      status: "active",
      fullName: "Gary Banks",
      email: "garybanks@gmail.com",
    },
    {
      id: "728ed52j",
      avatar: "https://i.pravatar.cc/150?img=19",
      status: "inactive",
      fullName: "Flora Chambers",
      email: "florachambers@gmail.com",
    },
    {
      id: "728ed52k",
      avatar: "https://i.pravatar.cc/150?img=20",
      status: "active",
      fullName: "Steve Hanson",
      email: "stevehanson@gmail.com",
    },
    {
      id: "728ed52l",
      avatar: "https://i.pravatar.cc/150?img=21",
      status: "active",
      fullName: "Lola Robinson",
      email: "lolarobinson@gmail.com",
    },
    {
      id: "728ed52m",
      avatar: "https://i.pravatar.cc/150?img=22",
      status: "active",
      fullName: "Ethel Waters",
      email: "ethelwaters@gmail.com",
    },
    {
      id: "728ed52n",
      avatar: "https://i.pravatar.cc/150?img=23",
      status: "inactive",
      fullName: "Grace Edwards",
      email: "graceedwards@gmail.com",
    },
    {
      id: "728ed52o",
      avatar: "https://i.pravatar.cc/150?img=24",
      status: "active",
      fullName: "Sallie Wong",
      email: "salliewong@gmail.com",
    },
    {
      id: "728ed52p",
      avatar: "https://i.pravatar.cc/150?img=25",
      status: "active",
      fullName: "Bryan Gutierrez",
      email: "bryangutierrez@gmail.com",
    },
    {
      id: "728ed52q",
      avatar: "https://i.pravatar.cc/150?img=26",
      status: "active",
      fullName: "Erik Rice",
      email: "erikrice@gmail.com",
    },
    {
      id: "728ed52r",
      avatar: "https://i.pravatar.cc/150?img=27",
      status: "active",
      fullName: "Jordan Atkins",
      email: "jordanatkins@gmail.com",
    },
    {
      id: "728ed52s",
      avatar: "https://i.pravatar.cc/150?img=28",
      status: "inactive",
      fullName: "Bill Brewer",
      email: "billbrewer@gmail.com",
    },
    {
      id: "728ed52t",
      avatar: "https://i.pravatar.cc/150?img=29",
      status: "active",
      fullName: "Edwin Morris",
      email: "edwinmorris@gmail.com",
    },
    {
      id: "728ed52u",
      avatar: "https://i.pravatar.cc/150?img=30",
      status: "active",
      fullName: "Harold Becker",
      email: "haroldbecker@gmail.com",
    },
    {
      id: "728ed52v",
      avatar: "https://i.pravatar.cc/150?img=31",
      status: "active",
      fullName: "Hannah Rodriguez",
      email: "hannahrodriguez@gmail.com",
    },
    {
      id: "728ed52w",
      avatar: "https://i.pravatar.cc/150?img=32",
      status: "active",
      fullName: "Zachary Beck",
      email: "zacharybeck@gmail.com",
    },
    {
      id: "728ed52x",
      avatar: "https://i.pravatar.cc/150?img=33",
      status: "inactive",
      fullName: "Frances Potter",
      email: "francespotter@gmail.com",
    },
    {
      id: "728ed52y",
      avatar: "https://i.pravatar.cc/150?img=34",
      status: "active",
      fullName: "Raymond Murray",
      email: "raymondmurray@gmail.com",
    },
    {
      id: "728ed52z",
      avatar: "https://i.pravatar.cc/150?img=35",
      status: "active",
      fullName: "Adam Sherman",
      email: "adamsherman@gmail.com",
    },
    {
      id: "728ed521f",
      avatar: "https://i.pravatar.cc/150?img=36",
      status: "active",
      fullName: "Anne Cruz",
      email: "annecruz@gmail.com",
    },
  ];
};

const UsersPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Users</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;
