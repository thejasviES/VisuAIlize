import Header from "@/components/shared/Header";
import React from "react";
import { transformationTypes } from "@/constants";
import TransformationForm from "@/components/shared/TransformationForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";



async function AddTransformatioTypePage({ params: { type } }: SearchParamProps) {
  
   const { userId } = auth();
   const transformation = transformationTypes[type];
   
   if (!userId) redirect("/sign-in");

   const user = await getUserById(userId);
   
  return (
    <div>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />
      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </div>
  );
}

export default AddTransformatioTypePage;
