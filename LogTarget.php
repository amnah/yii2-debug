<?php

namespace amnah\yii2\debug;

class LogTarget extends \yii\debug\LogTarget
{
    /**
     * @inheritdoc
     */
    protected function collectSummary()
    {
        // get original summary data
        $summary = parent::collectSummary();

        // add in profiling data
        $data = $this->module->panels['profiling']->save();
        $summary['profilingTime'] = $data['time'];
        $summary['profilingMemory'] = $data['memory'];
        $summary['profilingNumFiles'] = $data['numFiles'];

        return $summary;
    }
}
