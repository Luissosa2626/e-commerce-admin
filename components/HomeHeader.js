import { useSession } from "next-auth/react"

export default function  HomeHeader() {

    const {data:session} = useSession()

    return (
        <div className="text-blue-900 flex justify-between">
        <h2 className="mt-0">
            <div className="flex gap-2 items-center">
                <img className="rounded-full w-6 h-6 sm:hidden" src={session?.user?.image} alt=""/>
                <div>
                    Hello, {session?.user?.name}
                </div>
            </div>
        </h2>
        <div className="hidden sm:block">
          <div className="bg-gray-300 flex text-black gap-1 rounded-lg overflow-hidden">
            <img className="rounded-full w-6 h-6" src={session?.user?.image} alt=""/>
            <span className="px-2">
              {session?.user?.name}
            </span>
          </div>
        </div>
      </div>
    )
}