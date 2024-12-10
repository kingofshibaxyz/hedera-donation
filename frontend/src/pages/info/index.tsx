import NavigationBar from "@/components/NavBar";
import React from "react";

const InfoPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />

      <main className="container mx-auto py-16 px-6 md:px-20">
        <h2 className="text-5xl font-bold text-blue-800 mb-12 text-center">
          About Hedera Donations
        </h2>
        <section className="bg-white p-10 rounded-xl shadow-lg mb-16">
          <h3 className="text-3xl font-bold text-blue-700 mb-6">Our Mission</h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            At Hedera Donations, our mission is to create a transparent and
            efficient way for people to support meaningful causes using
            blockchain technology. We believe in decentralization, transparency,
            and empowering communities. Our platform allows donors to contribute
            directly to campaigns that align with their values while ensuring
            every transaction is secure and traceable on the blockchain.
          </p>
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Why Blockchain?
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            Blockchain technology provides an unparalleled level of security and
            transparency. By using blockchain, we can ensure that every donation
            is accounted for and used exactly as intended. This reduces fraud
            and guarantees that your contributions make a real difference.
          </p>
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            How We Operate
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            We work with trusted campaign organizers to bring forward causes
            that are impactful. Every campaign undergoes a vetting process to
            ensure it aligns with our core values. Our goal is to provide a
            secure, transparent, and easy-to-use platform where generosity and
            technology meet to change the world.
          </p>
        </section>
      </main>
    </div>
  );
};

export default InfoPage;
