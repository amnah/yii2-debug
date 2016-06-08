<?php

namespace amnah\yii2\debug\panels;

class ProfilingPanel extends \yii\debug\panels\ProfilingPanel
{
    /**
     * @inheritdoc
     */
    public function save()
    {
        $data = parent::save();
        $data["numFiles"] = count(get_included_files());
        return $data;
    }
}
