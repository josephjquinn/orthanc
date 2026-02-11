import torch
import torch.nn as nn

try:
    import segmentation_models_pytorch as smp
    _HAS_SMP = True
except ImportError:
    _HAS_SMP = False


class DamageSegmentationModel(nn.Module):
    def __init__(
        self,
        encoder_name: str = "resnet34",
        encoder_weights: str | None = "imagenet",
        in_channels: int = 6,
        num_classes: int = 5,
    ):
        super().__init__()
        if not _HAS_SMP:
            raise ImportError("segmentation_models_pytorch is required for DamageSegmentationModel")
        self.model = smp.Unet(
            encoder_name=encoder_name,
            encoder_weights=encoder_weights,
            in_channels=in_channels,
            classes=num_classes,
        )
        self.num_classes = num_classes

    def forward(self, pre_image: torch.Tensor, post_image: torch.Tensor) -> torch.Tensor:
        x = torch.cat([pre_image, post_image], dim=1)
        return self.model(x)
