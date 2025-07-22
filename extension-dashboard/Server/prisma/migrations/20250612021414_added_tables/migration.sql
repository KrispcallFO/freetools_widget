-- CreateTable
CREATE TABLE "Countries_Number" (
    "id" SERIAL NOT NULL,
    "countries" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "Countries_Number_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Number_Details" (
    "id" SERIAL NOT NULL,
    "countries" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "to_number" TEXT NOT NULL,
    "from_number" TEXT NOT NULL,
    "time_stamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Number_Details_pkey" PRIMARY KEY ("id")
);
