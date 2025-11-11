import prisma from "@/lib/db";

const Page = async () => {
  const users = await prisma.user.findMany();

  return <div>{users.map((user) => <div key={user.id}>{user.name}</div>)}</div>;
};

export default Page;