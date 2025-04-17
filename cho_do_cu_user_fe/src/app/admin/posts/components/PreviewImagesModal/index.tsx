import { Carousel, Image, Modal } from "antd";

export default function PreviewImagesModal({
    images,
    openImagesModal,
    setOpenImagesModal,
}: {
    images: string[];
    openImagesModal: boolean;
    setOpenImagesModal: (isOpen: boolean) => void;
}) {
    return (
        <Modal
            title="Ảnh bài đăng"
            open={openImagesModal}
            footer=""
            onCancel={() => setOpenImagesModal(false)}
            className="custom-modal"
            width={600}
        >
            <Carousel arrows className="custom-carousel">
                {images?.map((image: string, index: number) => (
                    <div
                        className="!flex justify-center justify-center bg-[#c8c8c8] py-8"
                        style={{ boxSizing: "border-box" }}
                        key={index}
                    >
                        <Image preview={false} src={image} />
                    </div>
                ))}
            </Carousel>
        </Modal>
    );
}
