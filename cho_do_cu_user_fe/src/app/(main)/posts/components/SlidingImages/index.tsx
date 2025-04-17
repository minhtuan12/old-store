"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

export default function SlidingImages({ images }: { images: string[] }) {
    return (
        <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
                delay: 2000,
                disableOnInteraction: true,
            }}
            pagination={{
                clickable: true,
            }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            className="w-full h-full flex items-center justify-center custom-swiper"
        >
            {images?.map((image) => (
                <SwiperSlide
                    key={image}
                    className="w-full h-full flex items-center justify-center"
                >
                    <Image
                        src={image}
                        alt={image}
                        width={200}
                        height={200}
                        className="relative left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[80%] h-auto"
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
